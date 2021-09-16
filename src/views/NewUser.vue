<template>
  <his-standard-form :activeField="activeField" @onIndex="activeField=''" :fields="fields" @onFinish="onFinish"/>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Field, Option } from "@/components/Forms/FieldInterface"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations"
import {PersonService} from "@/services/person_service"
import {Person} from "@/interfaces/person"
import {PersonAttribute} from "@/interfaces/personAttribute"
import {PersonAttributeService, NewAttribute} from '@/services/person_attributes_service'
import HisDate from "@/utils/Date"
import { isEmpty } from "lodash"

export default defineComponent({
  components: { HisStandardForm },
  data: () => ({
    fields: [] as Array<Field>,
    presets: {} as any,
    userData: {} as any,
    fieldComponent: '' as string,
    activeField: '' as string,
    form: {} as Record<string, Option> | Record<string, null>
  }),
  async created(){
    this.fields = this.getFields()
  },
  methods: {
    async onFinish(form: Record<string, Option> | Record<string, null>, computedData: any) {
        //TODO: DO something
    },
    create() {
        //TODO: Handle user creation
    },
    update() {
        //TODO: Handle user update
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
    getFields: function(): Array<Field> {
        return [
            {
                id: 'select_user',
                helpText: "Select Username",
                type: FieldType.TT_SELECT,
                validation: (val: any) => Validation.required(val),
                options: async () => {
                    return []
                }
            },
            {
                id: 'user_info',
                helpText: 'User information',
                type: FieldType.TT_TABLE_VIEWER,
                requireNext: false,
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
                        ['Username', this.userData.given_name, navButton('Change','username')],
                        ['Role', this.userData.given_name, navButton('Change', 'role')],
                        ['First name', this.userData.given_name, navButton('Edit','given_name')],
                        ['Last Name', this.userData.family_name, navButton('Edit', 'family_name')],
                        ['Authentication', '*******', navButton('Change Password', 'new_password')],
                        ['Status', this.userData.home_district,  deactivateButton()],
                        ['Date created', this.userData.birthdate, ''],
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
                group: 'person',
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
                group: 'person',
                validation: (val: any) => Validation.isName(val),
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
                group: 'user',
                validation: (val: any) => Validation.required(val),
                options: async () => {
                    return []
                }
            },
            {
                id: 'username',
                helpText: "Username",
                type: FieldType.TT_TEXT,
                group: 'user',
                validation: (val: any) => Validation.required(val),
                options: async () => {
                    return []
                }
            },
            {
                id: 'new_password',
                helpText: "Password",
                type: FieldType.TT_TEXT,
                group: 'user',
                validation: (val: any) => Validation.required(val),
            },
            {
                id: 'confirm_password',
                helpText: "Confirm Password",
                type: FieldType.TT_TEXT,
                group: 'user',
                validation: (val: any) => Validation.required(val),
            },
        ]
    }
  },
})
</script>