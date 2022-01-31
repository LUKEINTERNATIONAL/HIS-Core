<template>
  <his-standard-form
    @onIndex="fieldComponent=''" 
    :skipSummary="true"
    :activeField="fieldComponent" 
    :fields="fields" 
    :onFinishAction="onFinish"
    :cancelDestinationPath="`/patient/dashboard/${patientData.id}`"
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
import { RelationsService } from "@/services/relations_service"
import { isEmpty } from "lodash"
import PersonField from "@/utils/HisFormHelpers/PersonFieldHelper"
import { PatientRegistrationService } from "@/services/patient_registration_service"
import { nextTask } from "@/utils/WorkflowTaskHelper"
import { toastWarning } from "@/utils/Alerts";

export default defineComponent({
  components: { HisStandardForm },
  data: () => ({
    guardianData: {} as any,
    patientData: {} as any,
    fieldAction: '' as 'Scan' | 'Search' | 'Registration',
    fieldComponent: '' as string,
    fields: [] as Array<Field>,
    form: {} as Record<string, Option> | Record<string, null>,
    redirectURL: '' as string 
  }),
  watch: {
    '$route': {
        async handler({params, query}: any) {
            if (params.patient_id) {
                const patient = await Patientservice.findByID(params.patient_id)
                if (patient) {
                    this.patientData = this.toPersonData(patient.person)
                    this.fields = this.getFields()
                }
            }
            if(query.source) this.redirectURL = query.source
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
        if(this.isSameAsPatient(computedData)) {
            toastWarning("Guardian cannot be the same patient")
        } else {
            let guardianID = -1
            if (this.isRegistrationMode()) {
                const guardian: any = new PatientRegistrationService()
                await guardian.registerGuardian(PersonField.resolvePerson(computedData))
                guardianID = guardian.getPersonID()
            } else {
                guardianID = this.guardianData.id
            }
            await RelationsService.createRelation(
                this.patientData.id, guardianID, form.relations.other.relationship_type_id
            )
            if(this.redirectURL) this.$router.push({name: this.redirectURL})
            else await nextTask(this.patientData.id, this.$router)  
        }   
    },
    isSearchMode() {
        return ['Search', 'Registration'].includes(this.fieldAction)
    },
    isRegistrationMode() {
        return this.fieldAction === 'Registration'
    },
    toPersonData(data: any) {
        const address = data.addresses[0]
        return {
            id: data.person_id,
            name: `${data.names[0].given_name} ${data.names[0].family_name}`,
            birthdate: HisDate.toStandardHisDisplayFormat(data.birthdate),
            homeAddress: `${address.county_district} ${address.neighborhood_cell}`,
            gender: data.gender
        }
    },
    isSameAsPatient(guardian: any) {
        const birthdate = this.isRegistrationMode() && guardian.birth_date
            ? HisDate.toStandardHisDisplayFormat(guardian.birth_date.date)
            : this.guardianData.birthdate
        const guardianName = guardian.given_name.person + ' ' + guardian.family_name.person
        return (guardianName.toLowerCase() === this.patientData.name.toLowerCase()) 
            && (birthdate === this.patientData.birthdate)
            && (guardian.gender.person === this.patientData.gender)
    },
    mapToOption(listOptions: Array<string>): Array<Option> {
        return listOptions.map((item: any) => ({ label: item, value: item })) 
    },
    givenNameField(): Field {
        const name: Field = PersonField.getGivenNameField()
        name.helpText = 'Guardian First name'
        name.condition = () => this.isSearchMode()
        return name
    },
    familyNameField(): Field {
        const name: Field = PersonField.getFamilyNameField()
        name.helpText = 'Guardian Last name'
        name.condition = () => this.isSearchMode()
        return name
    },
    genderField(): Field {
        const gender: Field = PersonField.getGenderField()
        gender.condition = () => this.isSearchMode()
        return gender
    },
    dobFields(): Array<Field> {
        const dob =PersonField.getDobConfig() 
        dob.condition = () => this.isRegistrationMode()
        return generateDateFields(dob)
    },
    homeRegionField(): Field {
        const home: Field = PersonField.getHomeRegionField()
        home.condition = () => this.isRegistrationMode()
        return home
    },
    homeDistrictField(): Field {
        const district: Field = PersonField.getHomeDistrictField()
        district.condition = () => this.isRegistrationMode()
        return district
    },
    homeTAField(): Field {
        const ta: Field =  PersonField.getHomeTaField()
        ta.condition = (form: any) => this.isRegistrationMode()
            && !form.home_region.label.match(/foreign/i)
        return ta
    },
    homeVillageField(): Field {
        const village: Field = PersonField.getHomeVillageField()
        village.condition = (form: any) => this.isRegistrationMode()
            && !form.home_region.label.match(/foreign/i)
        return village
    },
    currentRegionField(): Field {
        const region: Field = PersonField.getCurrentRegionField()
        region.condition = () => this.isRegistrationMode()
        return region
    },
    currentDistrictField(): Field {
        const currentDistrict: Field = PersonField.getCurrentDistrictField()
        currentDistrict.condition = () => this.isRegistrationMode()
        return currentDistrict
    },
    currentTAField(): Field {
        const currentTA: Field = PersonField.getCurrentTAfield()
        currentTA.condition = (form: any) => this.isRegistrationMode()
            && !form.current_region.label.match(/foreign/i)
        return currentTA
    },
    currentVillage(): Field {
        const currentVillage: Field = PersonField.getCurrentVillageField()
        currentVillage.condition = (form: any) => this.isRegistrationMode()
            && !form.current_region.label.match(/foreign/i)
        return currentVillage
    },
    cellPhoneField(): Field {
        const cellPhone: Field = PersonField.getCellNumberField()
        cellPhone.condition = () => this.isRegistrationMode()
        return cellPhone 
    },
    landmarkField(): Field {
        const landmark: Field = PersonField.getLandmarkField()
        landmark.condition = () => this.isRegistrationMode()
        return landmark
    },
    relationsField(): Field {
        return {
            id: 'relations',
            helpText: 'Select relationship type',
            type: FieldType.TT_RELATION_SELECTION,
            validation: (val: Option) => Validation.required(val),
            onload: (context: any) => {
                context.patient = this.patientData
                if (this.isRegistrationMode()) {
                    const person = PersonField.resolvePerson(context.cdata)
                    context.guardian = {
                        name: `${person.given_name} ${person.family_name}`,
                        birthdate: HisDate.toStandardHisDisplayFormat(person.birthdate),
                        homeAddress: `${person.home_district} ${person.home_traditional_authority}`
                    }
                } else {
                    context.guardian = this.guardianData
                }
            },
            options: async() => {
                const relationships = await RelationsService.getRelations()
                return relationships.map((r: any) => ({
                    label: r.b_is_to_a, 
                    value: r.description, 
                    other: r
                }))
            },
            config: {
                hiddenFooterBtns: [
                  'Clear'
                ]
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
                if (!isEmpty(searchResults)) {
                    this.guardianData = this.toPersonData(searchResults[0].person)
                    this.fieldComponent = 'relations'
                    this.fieldAction = 'Scan'
                }
                return false
            },
            config: {
                hiddenFooterBtns: [
                    'Clear',
                    'Next'
                ],
                footerBtns : [
                    {
                        name: 'Find or Register Guardian',
                        color: 'success',
                        slot: 'end',
                        onClick: () => {
                            this.fieldAction = 'Search'
                            this.fieldComponent = 'given_name'
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
            dynamicHelpText: (f: any) => {
                return `Search results for 
                "${f.given_name.value} ${f.family_name.value} | ${f.gender.label}"
                `
            },
            appearInSummary: () => false,
            condition: () => this.isSearchMode(),
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
                        slot: 'end',
                        onClick: () => {
                            this.fieldAction = 'Search'
                            this.fieldComponent = 'given_name'
                        }
                    },
                    {
                        name: 'New Guardian',
                        slot: 'end',
                        onClick: () => {
                            this.fieldAction = 'Registration'
                            this.fieldComponent = 'year_birth_date'
                        }
                    },
                    {
                        name: 'Continue Guardian',
                        color: 'success',
                        slot: 'end',
                        state: {
                            disabled: {
                                default: () => true,
                                onValue(_: any,form: any) {
                                    return isEmpty(form.results)
                                }
                            }
                        },
                        onClick: (form: any) => {
                            this.guardianData = this.toPersonData(
                                form.results.other.person.person
                            )
                            this.fieldComponent = 'relations'
                            this.fieldAction = 'Search'
                        }
                    }
                ]
            }
        }
    }
  }
})
</script>