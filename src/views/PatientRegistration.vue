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
import { GlobalPropertyService } from "@/services/global_property_service" 
import { ProgramService } from "@/services/program_service";
import { toastWarning, toastDanger } from "@/utils/Alerts"
import { WorkflowService } from "@/services/workflow_service"
import { isPlainObject, isEmpty } from "lodash"
import PersonField from "@/utils/HisFormHelpers/PersonFieldHelper"
import { PatientRegistrationService } from "@/services/patient_registration_service"

export default defineComponent({
  components: { HisStandardForm },
  data: () => ({
    skipSummary: false,
    addressAttributes: [
        'home_region',
        'home_district',
        'home_traditional_authority',
        'home_village',
        'current_region',
        'current_district',
        'current_village',
        'current_traditional_authority'
    ] as Array<string>,  
    editPersonData: {} as any,
    editPerson: -1 as number,
    activeField: '' as string,
    fieldComponent: '' as string,
    fields: [] as Array<Field>,
    isMilitarySite: false,
    presets: {} as any,
    form: {} as Record<string, Option> | Record<string, null>
  }),
  computed: {
    showPatientType() {
        return ProgramService.getProgramID() == 1
    }
  },
  watch: {
    '$route': {
        async handler({query}: any) {
           if (query.edit_person) {
                await this.initEditMode(query.edit_person)
            } else {
                this.presets = query
            }
            this.fields = this.getFields()
            this.isMilitarySite = await GlobalPropertyService.isMilitarySite()
        },
        immediate: true,
        deep: true
    }
  },
  methods: {
    getFields(): Array<Field> {
        let fields: Array<Field> = []
        fields.push(this.personIndexField())
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
        fields.push(this.patientTypeField())
        fields.push(this.facilityLocationField())
        fields.push(this.occupationField())
        fields.push(this.regimentField())
        fields = fields.concat(this.dateJoinedMilitaryFields())
        fields.push(this.rankField())
        fields.push(this.relationshipField())
        return fields
    },
    isEditMode() {
        return this.editPerson >= 1
    },
    async initEditMode(personId: number) {
        this.editPerson = personId
        const person = await Patientservice.findByID(this.editPerson)
        if (!person) {
            return
        }
        const patient = new Patientservice(person)
        const { 
            ancestryDistrict, 
            ancestryTA, 
            ancestryVillage,
            currentDistrict,
            currentTA
        } = patient.getAddresses()
        this.editPersonData = {
            'given_name': patient.getGivenName(),
            'family_name': patient.getFamilyName(),
            'gender': patient.getGender(),
            'birthdate': patient.getBirthdate(),
            'home_district': ancestryDistrict,
            'home_traditional_authority': ancestryTA,
            'home_village': ancestryVillage,
            'current_district': currentDistrict,
            'current_traditional_authority': currentTA,
            'cell_phone_number': patient.getPhoneNumber(),
        }
        this.presets = this.editPersonData
        this.skipSummary = true
    },
    async onFinish(form: Record<string, Option> | Record<string, null>, computedData: any) {
        try {
            if (!this.isEditMode()) {
                return this.create(form, computedData)
            } else {
                return this.update(computedData)
            }
        } catch (e) {
            toastWarning(e)
        }
    },
    async create(form: any, computedData: any) {
        try {
            const person: any = PersonField.resolvePerson(computedData)
            const attributes: Array<any> = this.resolvePersonAttributes(computedData) 

            const registration: any = new PatientRegistrationService()
            await registration.registerPatient(person, attributes)
            let nextTask: any = {}
            
            // HACK: Check if filing numbers is enabled for ART programme
            if (PatientRegistrationService.getProgramID() === 1) {
                const filingNumberEnabled = await GlobalPropertyService.filingNumbersEnabled()
                if (filingNumberEnabled) {
                    nextTask = { 
                        name: 'filing management',
                        params: {
                            'patient_id': registration.getPersonID()
                        },
                        query: {

                        }
                    }
                    nextTask.query.assign = true
                    if (form.relationship.value === 'Yes') {
                        nextTask.query['next_workflow_task'] = 'Guardian Registration' 
                    }
                    return this.$router.push(nextTask)
                }
            }

            if (form.relationship.value === 'Yes') {
                nextTask = { 
                    path: '/guardian/registration', 
                    params: {
                        'patient_id': registration.getPersonID() 
                    }
                }
            } else {
                nextTask = await WorkflowService.getNextTaskParams(
                    registration.getPersonID()
                )
            }
            this.$router.push(nextTask)
        }catch(e) {
            toastDanger(e)
        }
    },
    async update(computedData: any) {
        const person: any = PersonField.resolvePerson(computedData)
        const update = new PatientRegistrationService()

        update.setPersonID(this.editPerson)
        await update.updatePerson(person)

        for(const attr in person) {
            if (attr in this.editPersonData) {
                this.editPersonData[attr] = person[attr]
            }
        }
        this.fieldComponent = 'edit_user'
    },
    editConditionCheck(attributes=[] as Array<string>): boolean {
        if (this.isEditMode() && !attributes.includes(this.activeField)) {
            return false
        }
        return true
    },
    resolvePersonAttributes(form: Record<string, Option> | Record<string, null>) {
        return Object.values(form)
                    .filter((d: any) => isPlainObject(d) && 'personAttributes' in d)
                    .map(({personAttributes}: any) => personAttributes)
    },
    mapToOption(listOptions: Array<string>): Array<Option> {
        return listOptions.map((item: any) => ({ label: item, value: item })) 
    },
    givenNameField(): Field {
        const name: Field = PersonField.getGivenNameField()
        name.condition = () => this.editConditionCheck(['given_name'])
        name.defaultValue = () => this.presets.given_name
        return name
    },
    familyNameField(): Field {
        const name: Field = PersonField.getFamilyNameField()
        name.condition = () => this.editConditionCheck(['family_name'])
        name.defaultValue = () => this.presets.family_name
        return name
    },
    genderField(): Field {
        const gender: Field = PersonField.getGenderField()
        gender.requireNext = this.isEditMode()
        gender.condition = () => this.editConditionCheck(['gender'])
        gender.defaultValue = () => {
            if (this.presets.gender) {
                if (this.presets.gender === 'M') {
                    return {label: 'Male', value: 'M'}
                }
                return {label: 'Female', value: 'F'}
            }
            return ''
        }
        return gender
    },
    dobFields(): Array<Field> {
        const dobConfig = PersonField.getDobConfig()
        dobConfig.defaultValue = () => this.presets.birthdate
        dobConfig.condition = () => this.editConditionCheck([
            'year_birth_date', 'month_birth_date', 'day_birth_date'
        ])
        return generateDateFields(dobConfig)
    },
    homeRegionField(): Field {
        const region: Field = PersonField.getHomeRegionField()
        region.condition = () => this.editConditionCheck(this.addressAttributes)
        return region
    },
    homeDistrictField(): Field {
        const district: Field = PersonField.getHomeDistrictField()
        district.condition = () => this.editConditionCheck(this.addressAttributes)
        return district
    },
    homeTAField(): Field {
        const homeTA: Field = PersonField.getHomeTaField()
        homeTA.condition = () => this.editConditionCheck(this.addressAttributes)
        return homeTA
    },
    homeVillageField(): Field {
        const homeVillage: Field = PersonField.getHomeVillageField()
        homeVillage.condition = () => this.editConditionCheck(this.addressAttributes)
        return homeVillage
    },
    currentRegionField(): Field {
        const currentRegion: Field = PersonField.getCurrentRegionField()
        currentRegion.condition = () => this.editConditionCheck(this.addressAttributes)
        return currentRegion
    },
    currentDistrictField(): Field {
        const currentDistrict: Field = PersonField.getCurrentDistrictField()
        currentDistrict.condition = () => this.editConditionCheck(this.addressAttributes)
        return currentDistrict
    },
    currentTAField(): Field {
        const currentTA: Field = PersonField.getCurrentTAfield()
        currentTA.condition = () => this.editConditionCheck(this.addressAttributes)
        return currentTA
    },
    currentVillage(): Field {
        const currentVillage: Field = PersonField.getCurrentVillageField()
        currentVillage.condition = () => this.editConditionCheck(this.addressAttributes)
        return currentVillage
    },
    cellPhoneField(): Field {
        const cellPhone: Field = PersonField.getCellNumberField()
        cellPhone.condition = () => this.editConditionCheck(['cell_phone_number'])
        cellPhone.defaultValue = () => this.presets.cell_phone_number
        return cellPhone 
    },
    facilityLocationField(): Field {
       const facility: Field = PersonField.getFacilityLocationField()
       facility.condition = (form: any) => form.patient_type.value === 'External consultation'
       return facility 
    },
    landmarkField(): Field {
        const landmark: Field = PersonField.getLandmarkField()
        landmark.condition = () => this.editConditionCheck(['land_mark'])
        return landmark
    },
    patientTypeField(): Field {
        return {
            id: 'patient_type',
            helpText: 'Type of patient',
            type: FieldType.TT_SELECT,
            computedValue: (val: Option) => ({person: val.value}),
            condition: () => this.editConditionCheck(['patient_type']) && this.showPatientType,
            validation: (val: any) => Validation.required(val),
            options: () => this.mapToOption([
                'New patient',
                'External consultation',
            ])
        }
    },
    occupationField(): Field {
        return {
            id: 'occupation',
            helpText: 'Occupation',
            type: FieldType.TT_SELECT,
            computedValue: (val: Option) => ({person: val.value}),
            condition: () => this.editConditionCheck(['occupation']) && this.isMilitarySite,
            validation: (val: any) => Validation.required(val),
            options: () => this.mapToOption([
                'MDF Reserve',
                'MDF Retired',
                'Civilian'
            ])
        }
    },
    regimentField(): Field {
        return {
            id: 'person_regiment_id',
            helpText: 'Regiment ID',
            type: FieldType.TT_TEXT,
            computedValue: ({value}: Option) => ({
                personAttributes: {
                    'person_attribute_type_id': 35, 
                    'value': value
                }
            }),
            condition: (form: any) => this.editConditionCheck(['person_regiment_id']) && form.occupation && form.occupation.value.match(/MDF/i),
            validation: (val: any) => Validation.required(val)
        }
    },
    rankField(): Field {
        return {
            id: 'rank',
            helpText: 'Rank',
            type: FieldType.TT_SELECT,
            validation: (val: any) => Validation.required(val),
            computedValue: ({value}: Option) => ({
                personAttributes: {
                    'person_attribute_type_id': 36, 
                    'value': value
                }
            }),
            condition: (form: any) => this.editConditionCheck(['rank']) && form.occupation && form.occupation.value.match(/MDF/i),
            options: () => this.mapToOption([
                'First Lieutenant',
                'Captain',
                'Major',
                'Lieutenant Colonel',
                'Colonel',
                'Brigadier General',
                'Lieutenant General',
                'General',
                'Private',
                'Corporal',
                'Lance Corporal',
                'Seargent',
                'Staff Seargent',
                'Warrant Officer class 1',
                'Warrant Officer class 2'
            ])
        }
    },
    dateJoinedMilitaryFields(): Array<Field> {
        return generateDateFields({
            id: 'person_date_joined_military',
            helpText: 'Joined Military',
            required: true,
            condition: (form: any) =>  this.editConditionCheck([
                'year_person_date_joined_military', 
                'month_person_date_joined_military', 
                'day_person_date_joined_military'
            ]) && form.occupation && form.occupation.value.match(/MDF/i),
            minDate: () => HisDate.estimateDateFromAge(100),
            maxDate: () => WorkflowService.getSessionDate(),
            estimation: {
                allowUnknown: false
            },
            computeValue: (date: string) => ({ 
                date, 
                personAttributes : {
                    'person_attribute_type_id': 37, 
                    'value': date
                }
            })
        })
    },
    relationshipField(): Field {
        return {
            id: 'relationship',
            helpText: 'Register guardian?',
            type: FieldType.TT_SELECT,
            computedValue: (val: Option) => ({person: val.value}),
            condition: () => this.editConditionCheck(['relationship']),
            validation: (val: any) => Validation.required(val),
            options: () => this.mapToOption(['Yes', 'No'])
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
            condition: () => !this.isEditMode(),
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
                            this.fieldComponent = 'given_name'
                        }
                    },
                    {
                        name: 'New Patient',
                        slot: 'end',
                        onClick: () => {
                            this.fieldComponent = 'year_birth_date'
                        }
                    },
                    {
                        name: 'Continue',
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
                            return this.$router.push(`/patients/confirm?person_id=${form.results.value}`)
                        }
                    }
                ]
            }
        }
    },
    personIndexField(): Field {
        return {
            id: 'edit_user',
            helpText: 'Edit Demographics',
            type: FieldType.TT_TABLE_VIEWER,
            requireNext: false,
            condition: () => this.editPerson != -1,
            options: async () => {
                const columns = ['Attributes', 'Values', 'Edit']
                const editButton = (attribute: string) => ({ 
                    name: 'Edit', 
                    type: 'button',
                    action: () => {
                        this.activeField = attribute
                        this.fieldComponent = this.activeField
                    }
                })
                const rows = [
                    ['Given Name', this.editPersonData.given_name, editButton('given_name')],
                    ['Family Name', this.editPersonData.family_name, editButton('family_name')],
                    ['Gender', this.editPersonData.gender,  editButton('gender')],
                    ['Birthdate', HisDate.toStandardHisDisplayFormat(this.editPersonData.birthdate),  editButton('year_birth_date')],
                    ['Cell Phone Number', this.editPersonData.cell_phone_number, editButton('cell_phone_number')],
                    ['Current district',this.editPersonData.current_district, editButton('home_region')],
                    ['Current T/A', this.editPersonData.current_traditional_authority, editButton('home_region')],
                    ['Home district', this.editPersonData.home_district, editButton('home_region')],
                    ['Home TA', this.editPersonData.home_traditional_authority,  editButton('home_region')],
                    ['Home Village', this.editPersonData.home_village,  editButton('home_region')],
                ]
                return [{
                    label: '',
                    value: '',
                    other: {
                        columns, rows
                    }
                }]
            },
            config: {
                hiddenFooterBtns: [
                    'Clear'
                ]
            }
        }
    },
  }
})
</script>