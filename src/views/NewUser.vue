<template>
  <his-standard-form 
    :activeField="fieldComponent" 
    @onIndex="fieldComponent=''" 
    :fields="fields" 
    @onFinish="onFinish"/>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Field, Option } from "@/components/Forms/FieldInterface"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations"
import { UserService } from "@/services/user_service"
import { PersonService } from "@/services/person_service"
import HisDate from "@/utils/Date"
import { toastWarning } from "@/utils/Alerts"

export default defineComponent({
  components: { HisStandardForm },
  data: () => ({
    fields: [] as Array<Field>,
    activity: '' as 'registration' | 'editing' | 'view',
    presets: {} as any,
    userData: {} as any,
    fieldComponent: '' as string,
    activeField: '' as string,
    userRoles: [] as Array<any>,
    form: {} as Record<string, Option> | Record<string, null>
  }),
  async created(){
    this.userRoles = await this.getRoles()
    this.fields = this.getFields()
  },
  methods: {
    async onFinish(form: Record<string, Option> | Record<string, null>) {
        try {
            if (this.activity === 'editing' || this.activity === 'view') {
                return this.update(form)
            } else {
                return this.create(form)
            }
        } catch (e) {
            toastWarning(e)
        }
    },
    async create(form: Record<string, Option> | Record<string, null>) {
        const data = this.resolveData(form, 'data_field')
        const newPerson = await UserService.createUser(data)
        if (newPerson) {
            this.userData = this.toUserData(newPerson)
            this.fieldComponent = 'user_info'
            this.activeField = this.fieldComponent
        }
        throw 'Unable to create new user, Possibly the user already exists or incorrect info was entered'
    },
    async update(form: Record<string, Option> | Record<string, null>) {
        const data = this.resolveData(form, 'data_field')
        const updatePerson = await UserService.updateUser(this.userData.id, data)
        if (updatePerson) {
            this.userData = this.toUserData(updatePerson)
            this.fieldComponent = 'user_info'
            this.activeField = this.fieldComponent
        }
        throw 'Unable to update user, possibly server error or incorrect information entered'

    },
    onChangeUserStatus() {
        //TODO: Handle user status logic
    },
    mapToOption(listOptions: Array<string>): Array<Option> {
        return listOptions.map((item: any) => ({ label: item, value: item })) 
    },
    navToFieldButton(name: string, target: string) {
        //TODO: move nav button logic here
    },
    deactivateButton(name: 'Deactivate') {
        //TODO: move activation logic here
    },
    resolveData(form: Record<string, Option> | Record<string, null>, group: string) {
        const output: any = {} 
        for(const name in form) {
            const data = form[name]
            const filter = this.fields.filter(item => {
                return item.id === name && item.group === group
            })

            if (filter.length <= 0) continue 

            if (data && data.value != null) output[name] = data.value
        }
        return output
    },
    async getRoles() {
        const roles = await UserService.getAllRoles()
        return roles.map((r: any) => ({
            label: r.role,
            value: r.uuid,
            other: r
        }))
    },
    toUserData(userObj: any) {
        const names = userObj.names[0]
        return {
            'id': userObj.user_id,
            'given_name': names.given_name,
            'family_name': names.family_name,
            'username': userObj.username,
            'role': userObj.roles.map((r: any) => r.role).split(', '),
            'created': userObj.date_created,
            'status': userObj.deactivated_on ? 'Deactivated' : 'Activated'
        }
    },
    editConditionCheck(attributes=[] as Array<string>): boolean {
        if (this.activity === 'editing' && !attributes.includes(this.activeField)) {
            return false
        }
        return true
    },
    getFields: function(): Array<Field> {
        return [
            {
                id: 'select_user',
                helpText: "Select Username",
                type: FieldType.TT_SELECT,
                condition: () => this.activity === 'view',
                validation: (val: any) => Validation.required(val),
                unload: ({other}: Option) => this.userData = this.toUserData(other),
                options: async () => {
                    const users: any = await UserService.getAllUsers()
                    return users.map((u: any) => ({
                        label: u.username,
                        value: u.user_id,
                        other: u
                    }))
                }
            },
            {
                id: 'user_info',
                helpText: 'User information',
                type: FieldType.TT_TABLE_VIEWER,
                requireNext: false,
                onload: () => this.activity = 'editing',
                condition: () => this.activeField === 'user_info',
                options: async () => {
                    const columns = ['Attributes', 'Values', 'Actions']
                    const deactivateButton = () => ({
                        name: 'Deactivate',
                        type: 'Button',
                        action: () => {
                            //TODO: DO something
                        }
                    })
                    const navButton = (name: string, targetField: string) => ({ 
                        name, 
                        type: 'button',
                        action: () => {
                            this.activeField = targetField
                            this.fieldComponent = this.activeField
                        }
                    })
                    const rows = [
                        ['Username', this.userData.given_name, navButton('Edit','given_name')],
                        ['Role', this.userData.role, navButton('Change', 'role')],
                        ['First name', this.userData.given_name, navButton('Edit','given_name')],
                        ['Last Name', this.userData.family_name, navButton('Edit', 'given_name')],
                        ['Authentication', '*******', navButton('Change Password', 'new_password')],
                        ['Status', this.userData.status,  deactivateButton()],
                        ['Date created', this.userData.created, ''],
                    ]
                    return [{
                        label: '',
                        value: '',
                        other: {
                            columns, rows
                        }
                    }]
                },
            },
            {
                id: 'given_name',
                helpText: 'First name',
                type: FieldType.TT_TEXT,
                group: 'data_field',
                condition: () => this.editConditionCheck(['given_name']),
                validation: (val: any) => Validation.isName(val),
                options: async (form: any) => {
                    if (!form.given_name || form.given_name.value === null) return []

                    const names = await PersonService.searchGivenName(form.given_name.value)
                    return this.mapToOption(names)
                }
            },
            {
                id: 'family_name',
                helpText: "Last name",
                type: FieldType.TT_TEXT,
                group: 'data_field',
                validation: (val: any) => Validation.isName(val),
                condition: () => this.editConditionCheck(['given_name']),
                options: async (form: any) => {
                    if (!form.family_name || form.family_name.value === null) return []

                    const names = await PersonService.searchFamilyName(form.family_name.value)
                    return this.mapToOption(names)
                }
            },
            {
                id: 'role',
                helpText: "Role",
                type: FieldType.TT_SELECT,
                group: 'data_field',
                condition: () => this.editConditionCheck(['role']),
                validation: (val: any) => Validation.required(val),
                options: () => this.userRoles
            },
            {
                id: 'username',
                helpText: "Username",
                type: FieldType.TT_TEXT,
                group: 'data_field',
                condition: () => this.editConditionCheck(['']),
                validation: (val: any) => Validation.required(val)
            },
            {
                id: 'new_password',
                helpText: "Password",
                type: FieldType.TT_TEXT,
                group: 'data_field',
                condition: () => this.editConditionCheck(['new_password']),
                validation: (val: any) => Validation.required(val),
            },
            {
                id: 'confirm_password',
                helpText: "Confirm Password",
                type: FieldType.TT_TEXT,
                group: 'data_field',
                condition: () => this.editConditionCheck(['new_password']),
                validation: (val: any) => Validation.required(val),
            },
        ]
    }
  },
})
</script>