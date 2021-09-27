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
import { RelationsService } from "@/services/relations_service"
import { isPlainObject, isEmpty, findIndex } from "lodash"
import PersonField from "@/utils/HisFormHelpers/PersonFieldHelper"
import { PatientRegistrationService } from "@/services/patient_registration_service"

export default defineComponent({
  components: { HisStandardForm },
  data: () => ({
    skipSummary: false,
    guardianData: {} as any,
    patientData: {} as any,
    activeField: '' as string,
    fieldComponent: '' as string,
    fields: [] as Array<Field>,
    form: {} as Record<string, Option> | Record<string, null>
  }),
  watch: {
    '$route': {
        async handler({query}: any) {
            if (query.patient) {
                const patient = await Patientservice.findByID(query.patient)
                if (patient) {
                    this.patientData = new Patientservice(patient)
                    this.fields = this.getFields()
                }
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
        fields.push(this.relationsField())
        return fields
    },
    async onFinish(form: any, computedData: any) {
        try {
            let guardianID = -1
            const patientID = this.patientData.getID()
            if (isEmpty(this.guardianData)) {
                const guardian: any = new PatientRegistrationService()
                await guardian.registerGuardian(this.resolvePerson(computedData))
                guardianID = guardian.getPersonID()
            } else {
                guardianID = this.guardianData.person_id
            }
            await RelationsService.createRelation(
                guardianID, patientID, form.relations.other.relatonship_type_id
            )
            const nextTask = await WorkflowService.getNextTaskParams(patientID)
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
    givenNameField(): Field {
        const name: Field = PersonField.getGivenNameField()
        name.helpText = 'Guardian First name'
        name.onload = () => this.guardianData = {}
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
        return PersonField.getLandmarkField()
    },
    relationsField(): Field {
        return {
            id: 'relations',
            helpText: 'Select relationship type',
            type: FieldType.TT_RELATION_SELECTION,
            options: async() => {
                const relationships = await RelationsService.getRelations()
                return relationships.map((r: any) => ({
                    label: r.b_is_to_a,
                    value: r.description,
                    other: r
                }))
            }
        }
    },
    scanGuardian(): Field {
        return {
            id: 'scan',
            helpText: 'Scan or Register Guardian',
            type: FieldType.TT_BARCODE,
            requireNext: false,
            onValue: async (id: string) => {
                const searchResults = await Patientservice.findByNpid(id)
                if (searchResults) {
                    this.guardianData = searchResults
                    this.fieldComponent = 'relations'
                }
                return false
            },
            config: {
                hiddenFooterBtns: [
                    'Clear'
                ],
                footerBtns : [
                    {
                        name: 'Find or Register Guardian',
                        size: 'large',
                        color: 'success',
                        slot: 'end',
                        visible: true,
                        onClick: () => {
                            this.fieldComponent = 'given_name'
                        },
                        visibleOnStateChange: (state: any) => {
                            return state.field.id === 'scan'
                        }
                    }
                ]
            }
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
                const newGuardianIndex = findIndex(btns, { name: 'Continue Guardian' })
                if (!isEmpty(val)) {
                    env.footer.footerBtns[newGuardianIndex].visible = true
                    env.footer.footerBtns[newGuardianIndex].onClick = () => {
                       this.guardianData = val.other.person
                       this.fieldComponent = 'relations'
                    }
                } else {
                    env.footer.footerBtns[newGuardianIndex].visible = false
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