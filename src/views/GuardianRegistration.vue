<template>
  <his-standard-form
    @onIndex="fieldComponent=''" 
    :skipSummary="skipSummary"
    :activeField="fieldComponent" 
    :fields="fields" 
    @onFinish="onFinish"
 />
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Field, Option } from "@/components/Forms/FieldInterface"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { generateDateFields } from "@/utils/HisFormHelpers/MultiFieldDateHelper"
import Validation from "@/components/Forms/validations/StandardValidations"
import { Patientservice } from "@/services/patient_service"
import HisDate from "@/utils/Date"
import { toastWarning, toastDanger } from "@/utils/Alerts"
import { WorkflowService } from "@/services/workflow_service"
import { isPlainObject, isEmpty, findIndex } from "lodash"
import PersonField from "@/utils/HisFormHelpers/PersonFieldHelper"
import { PatientRegistrationService, LAND_MARK_LOCATIONS } from "@/services/patient_registration_service"

export default defineComponent({
  components: { HisStandardForm },
  data: () => ({
    skipSummary: false,
    activeField: '' as string,
    fieldComponent: '' as string,
    fields: [] as Array<Field>,
    form: {} as Record<string, Option> | Record<string, null>
  }),
  watch: {
    '$route': {
        async handler({query}: any) {
            if (query.patient) {
                this.fields = this.getFields()
            }
        },
        immediate: true,
        deep: true
    }
  },
  methods: {
    getFields(): Array<Field> {
        let fields: Array<Field> = []
        fields.push(this.scanGuardian())
        fields.push(this.givenNameField())
        fields.push(this.familyNameField())
        fields.push(this.genderField())
        fields.push(this.searchResultField())
        fields = fields.concat(this.dobFields())
        fields.push(this.homeRegionField())
        fields.push(this.homeDistrictField())
        fields.push(this.homeTAField())
        fields.push(this.homeVillageField())
        fields.push(this.currentRegionField())
        fields.push(this.currentDistrictField())
        fields.push(this.currentTAField())
        fields.push(this.currentVillage())
        fields.push(this.landmarkField())
        fields.push(this.cellPhoneField())
        return fields
    },
    async onFinish(_: Record<string, Option> | Record<string, null>, computedData: any) {
        try {
            const person: any = this.resolvePerson(computedData)

            const registration: any = new PatientRegistrationService()
            await registration.registerGuardian(person)

            const nextTask = await WorkflowService.getNextTaskParams(
                registration.getPersonID()
            )
            this.$router.push(nextTask)
        }catch(e) {
            toastDanger(e)
        }
    },
    resolvePerson(computedForm: any) {
        let data: any = {}
        for(const attr in computedForm) {
            const values = computedForm[attr]
            if ('person' in values) {
                if (isPlainObject(values.person)) {
                    data = {...data, ...values.person}
                } else {
                    data[attr] = values['person']
                }
            }
        }
        return data   
    },
    mapToOption(listOptions: Array<string>): Array<Option> {
        return listOptions.map((item: any) => ({ label: item, value: item })) 
    },
    scanGuardian(): Field {
        return {
            id: 'scan',
            helpText: 'Scan or Register Guardian',
            type: FieldType.TT_BARCODE
        }
    },
    givenNameField(): Field {
        const name: Field = PersonField.getGivenNameField()
        name.helpText = 'Guardian First name'
        return name
    },
    familyNameField(): Field {
        const name: Field = PersonField.getFamilyNameField()
        name.helpText = 'Guardian Last name'
        return name
    },
    genderField(): Field {
        return PersonField.getGenderField()
    },
    dobFields(): Array<Field> {
        return generateDateFields(PersonField.getDobConfig())
    },
    homeRegionField(): Field {
        return PersonField.getHomeRegionField()
    },
    homeDistrictField(): Field {
        return PersonField.getHomeDistrictField()
    },
    homeTAField(): Field {
        return PersonField.getHomeTaField()
    },
    homeVillageField(): Field {
        return PersonField.getHomeVillageField()
    },
    currentRegionField(): Field {
        return PersonField.getCurrentRegionField()
    },
    currentDistrictField(): Field {
        return PersonField.getCurrentDistrictField()
    },
    currentTAField(): Field {
        return PersonField.getCurrentTAfield()
    },
    currentVillage(): Field {
        return PersonField.getCurrentVillageField()
    },
    cellPhoneField(): Field {
        return PersonField.getCellNumberField()
    },
    landmarkField(): Field {
        return {
            id: 'landmark',
            helpText: 'Closest Landmark or Plot Number',
            group: 'person',
            type: FieldType.TT_SELECT,
            computedValue: (val: Option) => ({person: val.value}),
            validation: (val: any) => Validation.required(val),
            options: () => this.mapToOption(LAND_MARK_LOCATIONS)
        }
    },
    searchResultField(): Field {
        return {
            id: 'results',
            helpText: 'Search results',
            type: FieldType.TT_PERSON_RESULT_VIEW,
            appearInSummary: () => false,
            onValue: (val: Option, { env }: any) => {
                const btns = env.footer.footerBtns
                const confirmIndex = findIndex(btns, { name: 'Continue Guardian' })
                if (!isEmpty(val)) {
                    env.footer.footerBtns[confirmIndex].visible = true
                    env.footer.footerBtns[confirmIndex].onClick = () => {
                       return this.$router.push(`/patients/confirm?person_id=${val.value}`)
                    }
                } else {
                    env.footer.footerBtns[confirmIndex].visible = false
                }
                return true
            },
            validation: (val: Option) => Validation.required(val),
            options: async (form: any) => {
                const patients = await Patientservice.search({
                    'given_name': form.given_name.value, 
                    'family_name': form.family_name.value, 
                    'gender': form.gender.value, 
                });
                return patients.map((item: any) => PersonField.getPersonAttributeOptions(item))
            },
            config: {
                hiddenFooterBtns: [
                    'Clear',
                    'Next',
                    'Back'
                ],
                footerBtns: [
                    {
                        name: 'Edit Search',
                        size: 'large',
                        slot: 'end',
                        visible: true,
                        onClick: () => {
                            this.fieldComponent = 'given_name'
                        },
                        visibleOnStateChange: (state: any) => {
                            return state.field.id === 'results'
                        }
                    },
                    {
                        name: 'New Guardian',
                        size: 'large',
                        slot: 'end',
                        visible: true,
                        onClick: () => {
                            this.fieldComponent = 'year_birth_date'
                        },
                        visibleOnStateChange: (state: any) => {
                            return state.field.id === 'results'
                        }
                    },
                    {
                        name: 'Continue Guardian',
                        color: 'success',
                        size: 'large',
                        slot: 'end',
                        visible: false
                    }
                ]
            }
        }
    }
  }
})
</script>