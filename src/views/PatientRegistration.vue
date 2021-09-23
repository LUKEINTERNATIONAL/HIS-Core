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
import { PersonService } from "@/services/person_service"
import {Person} from "@/interfaces/person"
import {PersonAttributeService } from '@/services/person_attributes_service'
import { Patientservice } from "@/services/patient_service"
import HisDate from "@/utils/Date"
import { GlobalPropertyService } from "@/services/global_property_service" 
import { ProgramService } from "@/services/program_service";
import { EncounterService } from "@/services/encounter_service";
import { Encounter } from "@/interfaces/encounter";
import { ConceptService } from "@/services/concept_service";
import { ObservationService } from "@/services/observation_service";
import { PatientPrintoutService } from "@/services/patient_printout_service";
import { toastWarning } from "@/utils/Alerts"
import { WorkflowService } from "@/services/workflow_service"
import { isEmpty, isPlainObject } from "lodash"
import PersonField from "@/utils/HisFormHelpers/PersonFieldHelper"

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
        if (!person) return
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
    async onFinish(_: Record<string, Option> | Record<string, null>, computedData: any) {
        try {
            if (!this.isEditMode()) {
                return this.create(computedData)
            } else {
                return this.update(computedData)
            }
        } catch (e) {
            toastWarning(e)
        }
    },
    async create(computedData: any) {
        const personPayload: any = this.resolvePerson(computedData)
        const person: Person = await new PersonService(personPayload).create()
        if (person.person_id) {
            await this.savePersonAttributes(computedData, person.person_id)
            await ProgramService.createPatient(person.person_id)
            .then(() => {
                ProgramService.enrollPatient(person.person_id)
                .then(() => {
                    this.createRegistrationEncounter(person.person_id)
                    .then((data: Encounter) => {
                        this.createRegistrationOs(data, personPayload.patient_type? personPayload.patient_type : 'New patient')
                        .then(() => new PatientPrintoutService(person.person_id).printNidLbl())
                        .then(async () => {
                            const params = await WorkflowService.getNextTaskParams(person.person_id)
                            this.$router.push(params)
                        })
                    })
                })
            });
        }
    },
    async update(computedData: any) {
        const person: any = this.resolvePerson(computedData)
        if (!isEmpty(person)) {
            await new PersonService(person).update(this.editPerson)
            for(const attr in person) {
                if (attr in this.editPersonData) {
                    this.editPersonData[attr] = person[attr]
                }
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
    async savePersonAttributes(form: Record<string, Option> | Record<string, null>, personId: number) {
        const data = Object.values(form)
                            .filter((d: any) => isPlainObject(d) && 'personAttributes' in d)
                            .map(async ({personAttributes}: any) => {
                                return PersonAttributeService.create({
                                    ...personAttributes, 
                                    'person_id': personId
                                })  
                            })
        await Promise.all(data)
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
    createRegistrationEncounter(patientID: number) {
        return EncounterService.create({
            'encounter_type_id': 5, //TODO: get key from api or reference dictionary using name
            'patient_id': patientID
        })
    },
    createRegistrationOs(encounter: Encounter, patientType: string) {
        let ans: number;
        const typeOfPatientConcept = ConceptService.getCachedConceptID('Type of patient');
        if(this.showPatientType == true) {
            ans  = ConceptService.getCachedConceptID(patientType)
        }else{
            ans  = ConceptService.getCachedConceptID('New patient')
        }
        const obs = {
            'encounter_id': encounter.encounter_id,
            observations: [
                {'concept_id': typeOfPatientConcept, 'value_coded': ans}
            ]
        };
        return ObservationService.create(obs);
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
        return {
            id: 'landmark',
            helpText: 'Closest Landmark or Plot Number',
            group: 'person',
            type: FieldType.TT_SELECT,
            computedValue: (val: Option) => ({person: val.value}),
            condition: () => this.editConditionCheck(['land_mark']),
            validation: (val: any) => Validation.required(val),
            options: () => this.mapToOption([
                'Catholic Church',
                'CCAP',
                'Seventh Day',
                'Mosque',
                'Primary School',
                'Borehole',
                'Secondary School',
                'College',
                'Market',
                'Football Ground',
                'Other'
            ])
        }
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