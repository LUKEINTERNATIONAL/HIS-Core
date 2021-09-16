<template>
  <his-standard-form 
    :activeField="fieldComponent"
    :skipSummary="true"
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
import { toastWarning, toastSuccess } from "@/utils/Alerts"

export default defineComponent({
  components: { HisStandardForm },
  data: () => ({
    fields: [] as Array<Field>,
    activity: 'registration' as 'registration' | 'editing' | 'view',
    presets: {} as any,
    userData: {} as any,
    fieldComponent: '' as string,
    activeField: '' as string,
    form: {} as Record<string, Option> | Record<string, null>
  }),
  watch: {
    '$route': {
        async handler({query}: any) {
            if (query && ['view', 'editing', 'registration'].includes(query.activity)) {
                this.activity = query.activity
            }
        },
        immediate: true,
        deep: true
    }
  },
  async created() {
    this.fields = this.getFields()
  },
  methods: {
    async onFinish(form: Record<string, Option> | Record<string, null>, computeValues: any) {
        const data = {...this.resolveData(form, 'data_field'), ...computeValues}
        try {
            if (['editing', 'view'].includes(this.activity)) {
                await this.update(data)
            } else {
                await this.create(data)
            }
            this.fieldComponent = 'user_info'
            this.activeField = this.fieldComponent
        } catch (e) {
            toastWarning(e)
        }

    },
    async create(data: any) {
        const newPerson = await UserService.createUser(data)
        if (newPerson) {
            this.userData = this.toUserData(newPerson.user)
            return
        }
        throw 'Unable to create new user, Possibly the user already exists or incorrect info was entered'
    },
    async update(data: any) {
        const updatePerson = await UserService.updateUser(this.userData.id, data)
        if (updatePerson) {
            this.userData = this.toUserData(updatePerson)
            return
        }
        throw 'Unable to update user, possibly server error or incorrect information entered'
    },
    mapToOption(listOptions: Array<string>): Array<Option> {
        return listOptions.map((item: any) => ({ label: item, value: item })) 
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
            value: r.role,
            other: r
        }))
    },
    toUserData(userObj: any) {
        const names = userObj.person.names[0]
        return {
            'id': userObj.user_id,
            'given_name': names.given_name,
            'family_name': names.family_name,
            'username': userObj.username,
            'role': userObj.roles.map((r: any) => r.role).join(', '),
            'created': HisDate.toStandardHisDisplayFormat(userObj.date_created),
            'status': userObj.deactivated_on ? 'Inactive' : 'Active'
        }
    },
    editConditionCheck(attributes=[] as Array<string>): boolean {
        if (['editing', 'view'].includes(this.activity) 
            && !attributes.includes(this.activeField)) {
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
                onload: () => this.activity != 'view' ? this.activity = 'editing': null,
                condition: (f: any) => this.activeField === 'user_info' || f.select_user.value,
                options: async () => {
                    const status = this.userData.status === 'Active' ? 'Deactivate' : 'Activate'
                    const columns = ['Attributes', 'Values', 'Actions']
                    const deactivateButton = () => ({
                        name: status ,
                        type: 'button',
                        action: async () => {
                            try {
                                if (status === 'Deactivate') {
                                    await UserService.deactivateUser(this.userData.id)
                                    toastSuccess('User has been deactivated')
                                }
                                if (status === 'Activate') {
                                    await UserService.activateUser(this.userData.id)
                                    toastSuccess('User has been activated')
                                }
                            } catch(e) {
                                toastWarning(e)
                            }
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
                        ['Role', this.userData.role, navButton('Edit', 'roles')],
                        ['First name', this.userData.given_name, navButton('Edit','given_name')],
                        ['Last Name', this.userData.family_name, navButton('Edit', 'given_name')],
                        ['Password', '*******', navButton('Edit', 'new_password')],
                        ['Status', this.userData.status,  deactivateButton()],
                        ['Date created', this.userData.created, ''],
                    ]
                    return [{
                        label: '',
                        value: '',
                        other: { columns, rows }
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
                id: 'roles',
                helpText: "Role",
                type: FieldType.TT_SELECT,
                computedValue: (val: Option) => [val.value],
                condition: () => this.editConditionCheck(['roles']),
                validation: (val: any) => Validation.required(val),
                options: async() => await this.getRoles()
            },
            {
                id: 'must_append_roles',
                helpText: "Would you like to append role?",
                type: FieldType.TT_SELECT,
                group: 'data_field',
                computedValue: (val: Option) => val.label === 'Yes' ? true : false,
                condition: (f: any) =>  f.roles.value  && ['view', 'editing'].includes(this.activity) && this.editConditionCheck(['roles']),
                validation: (val: any) => Validation.required(val),
                options: () => [
                    {
                        label: 'Yes', value: 'true'
                    },
                    {
                        label: 'No', value: 'false'
                    }
                ]
            },
            {
                id: 'username',
                helpText: "Username",
                type: FieldType.TT_TEXT,
                group: 'data_field',
                condition: () => this.editConditionCheck(['nothing to see here']),
                validation: (val: any) => Validation.required(val)
            },
            {
                id: 'new_password',
                helpText: "New Password",
                type: FieldType.TT_TEXT,
                condition: () => this.editConditionCheck(['new_password']),
                validation: (val: any) => Validation.required(val),
                config: {
                    inputType: 'password'
                }
            },
            {
                id: 'password',
                helpText: "Confirm Password",
                type: FieldType.TT_TEXT,
                group: 'data_field',
                condition: () => this.editConditionCheck(['new_password']),
                validation: (val: any, f: any) => Validation.required(val) || f.new_password.value != val.value ? ['Confirm password doesnt match previous password']: null,
                config: {
                    inputType: 'password'
                }
            },
        ]
    }
  },
})
</script>