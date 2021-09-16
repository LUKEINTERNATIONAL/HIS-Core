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
import { generateDateFields, EstimationFieldType } from "@/utils/HisFormHelpers/MultiFieldDateHelper"
import Validation from "@/components/Forms/validations/StandardValidations"
import {LocationService} from "@/services/location_service"
import {PersonService, NewPerson} from "@/services/person_service"
import {Person} from "@/interfaces/person"
import {PersonAttribute} from "@/interfaces/personAttribute"
import {PersonAttributeService, NewAttribute} from '@/services/person_attributes_service'
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
import { isEmpty } from "lodash"

export default defineComponent({
  components: { HisStandardForm },
  data: () => ({
    skipSummary: false,
    addressAttributes: [
        'home_region', 
        'home_district', 
        'home_traditional_authority', 
        'home_village',
        'current_district',
        'current_traditional_authority',
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
            'home_ta': ancestryTA,
            'home_village': ancestryVillage,
            'current_district': currentDistrict,
            'current_ta': currentTA,
            'cell_phone_number': patient.getPhoneNumber(),
        }
        this.presets = this.editPersonData
        this.skipSummary = true
    },
    async onFinish(form: Record<string, Option> | Record<string, null>, computedData: any) {
        try {
            if (this.editPerson <= 0) {
                return this.create(form, computedData)
            } else {
                return this.update(form, computedData)
            }
        } catch (e) {
            toastWarning(e)
        }
    },
    async create(form: Record<string, Option> | Record<string, null>, computedData: any) {
        const personPayload: NewPerson = this.resolvePerson(form, computedData)
        const person: Person = await new PersonService(personPayload).create()
        if (person.person_id) {
            const attributesPayload: Array<NewAttribute> = this.resolvePersonAttributes(form, person.person_id)     
            if (attributesPayload.length >= 1) {
                await PersonAttributeService.create(attributesPayload)  
            }
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
    async update(form: Record<string, Option> | Record<string, null>, computedData: any) {
        const person: any = this.resolvePerson(form, computedData)
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
        if (this.editPerson > 0 && !attributes.includes(this.activeField)) {
            return false
        }
        return true
    },
    resolvePersonAttributes(form: Record<string, Option> | Record<string, null>, personId: number) {
        const data: Record<string, string> = this.resolveData(form, 'person_attributes')
        return this.generatePersonAttributes(data, personId)
    },
    resolvePerson(form: any, computedForm: any) {
        return {...this.resolveBirthDate(computedForm), ...this.resolveData(form, 'person')}
    },
    resolveBirthDate(data: any) {
        const value: any = Object.values(data).filter((i: any) => i.dob)
        return !isEmpty(value) ? value[0].dob : {}
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
    generatePersonAttributes(data: Record<string, string> | Record<string, number>, personId: number) {
        const patientAttributes: Array<PersonAttribute> = []
        // TODO: retrieve these identifiers using API call
        const attrMap: Record<string, number> = {
            'person_regiment_id': 35,
            'person_date_joined_military': 37,
            'rank': 36
        }
        for (const attr in data) {
            const value = data[attr]
            patientAttributes.push({ 
                'person_id': personId,
                'person_attribute_type_id': attrMap[attr], 
                value: value.toString()
            })
        }
        return patientAttributes
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
    getFieldPreset(attr: string) {
        if (attr in this.presets) {
            const val = this.presets[attr]
            return { label: val, value: val }
        }
    },
    async getFacilities(filter=''): Promise<Option[]> {
        const facilities = await LocationService.getFacilities({name: filter})
        return facilities.map((facility: any) => ({
            label: facility.name,
            value: facility.location_id
        }))
    },
    async getRegions(): Promise<Option[]> {
        const regions = await LocationService.getRegions()
        return regions.map((region: any) => ({
            label: region.name,
            value: region.name,
            other: {
                id: region.region_id
            }
        }))
    },
    async getDistricts(regionID: number): Promise<Option[]> {
        const districts = await LocationService.getDistricts(regionID)
        return districts.map((district: any) => ({
            label: district.name,
            value: district.name,
            other: {
                id: district.district_id
            }
        }))
    },
    async getTraditionalAuthorities(districtID: number): Promise<Option[]> {
        const TAs = await LocationService.getTraditionalAuthorities(districtID)
        return TAs.map((TA: any) => ({
            label: TA.name,
            value: TA.name,
            other: {
                id: TA.traditional_authority_id
            }
        }))
    },
    async getVillages(traditionalAuthorityID: number): Promise<Option[]> {
        const villages = await LocationService.getVillages(traditionalAuthorityID)
        return villages.map((village: any) => ({
            label: village.name,
            value: village.name,
            other: {
                id: village.village_id
            }
        }))
    },
    getFields: function(): Array<Field> {
        return [
            {
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
                        ['Birthdate', this.editPersonData.birthdate,  editButton('year_birth_date')],
                        ['Home district', this.editPersonData.home_district,  editButton('home_region')],
                        ['Home TA', this.editPersonData.home_ta,  editButton('home_region')],
                        ['Home Village', this.editPersonData.home_village,  editButton('home_region')],
                        ['Current district',this.editPersonData.current_district, editButton('home_region')],
                        ['Current T/A', this.editPersonData.current_ta, editButton('home_region')],
                        ['Cell Phone Number', this.editPersonData.cell_phone_number, editButton('cell_phone_number')],
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
            },
            {
                id: 'given_name',
                helpText: 'First name',
                type: FieldType.TT_TEXT,
                group: 'person',
                preset: this.getFieldPreset('given_name'),
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
                group: 'person',
                preset: this.getFieldPreset('family_name'),
                condition: () => this.editConditionCheck(['family_name']),
                validation: (val: any) => Validation.isName(val),
                options: async (form: any) => {
                    if (!form.family_name || form.family_name.value === null) {
                        return []
                    } 
                    const names = await PersonService.searchFamilyName(form.family_name.value)
                    return this.mapToOption(names)
                }
            },
            {
                id: 'gender',
                helpText: 'Gender',
                type: FieldType.TT_SELECT,
                group: 'person',
                requireNext: false,
                preset: this.getFieldPreset('gender'),
                condition: () => this.editConditionCheck(['gender']),
                validation: (val: any) => Validation.required(val),
                options: () => ([
                    { 
                        label: 'Male',
                        value: 'M'
                    },
                    {
                        label: 'Female',
                        value: 'F'
                    }
                ])
            },
            ...generateDateFields({
                id: 'birth_date',
                helpText: 'Birth',
                required: true,
                condition: () => this.editConditionCheck([
                    'year_birth_date', 'month_birth_date', 'day_birth_date'
                ]),
                minDate: () => HisDate.estimateDateFromAge(100),
                maxDate: () => WorkflowService.getSessionDate(),
                estimation: {
                    allowUnknown: true,
                    estimationFieldType: EstimationFieldType.AGE_ESTIMATE_FIELD
                },
                computeValue: (date: string, isEstimate: boolean) => {
                    return {
                        date,
                        isEstimate,
                        dob: {
                            birthdate: date,
                            'birthdate_estimated': isEstimate
                        }
                    }
                }
            }),
            {
                id: 'home_region',
                helpText: 'Region of origin',
                type: FieldType.TT_SELECT,
                group: 'person',
                requireNext: false,
                condition: () => this.editConditionCheck(this.addressAttributes),
                validation: (val: any) => Validation.required(val),
                options: () => this.getRegions()
            },
            {
                id: 'home_district',
                helpText: 'Home District',
                type: FieldType.TT_SELECT,
                group: 'person',
                requireNext: false,
                condition: (form: any) => this.editConditionCheck(this.addressAttributes) && !form.home_region.label.match(/foreign/i),
                options: (form: any) => this.getDistricts(form.home_region.other.id)
            },
            {
                id: 'home_traditional_authority',
                helpText: 'Home TA',
                type: FieldType.TT_SELECT,
                requireNext: false,
                config: {
                    showKeyboard: true
                },
                group: 'person',
                condition: (form: any) => this.editConditionCheck(this.addressAttributes) && !form.home_region.label.match(/foreign/i),
                validation: (val: any) => Validation.required(val),
                options: (form: any) => this.getTraditionalAuthorities(form.home_district.other.id)
            },
            {
                id: 'home_village',
                helpText: 'Home Village',
                type: FieldType.TT_SELECT,
                group: 'person',
                config: {
                    showKeyboard: true
                },
                requireNext: false,
                validation: (val: any) => Validation.required(val),
                condition: (form: any) => this.editConditionCheck(this.addressAttributes) && !form.home_region.label.match(/foreign/i),
                options: (form: any) => this.getVillages(form.home_traditional_authority.other.id)
            },
            {
                id: 'current_region',
                helpText: 'Current Region',
                requireNext: false,
                group: 'person',
                type: FieldType.TT_SELECT,
                validation: (val: any) => Validation.required(val),
                condition: () => this.editConditionCheck(this.addressAttributes),
                options: () => this.getRegions()
            },
            {
                id: 'current_district',
                helpText: 'District',
                requireNext: false,
                group: 'person',
                type: FieldType.TT_SELECT,
                validation: (val: any) => Validation.required(val),
                condition: () => this.editConditionCheck(this.addressAttributes),
                options: (form: any) => this.getDistricts(form.current_region.other.id)
            },
            {
                id: 'current_traditional_authority',
                helpText: 'Current TA',
                requireNext: false,
                group: 'person',
                type: FieldType.TT_SELECT,
                condition: () => this.editConditionCheck(this.addressAttributes),
                validation: (val: any) => Validation.required(val),
                options: (form: any) => this.getTraditionalAuthorities(form.current_district.other.id)
            },
            {
                id: 'current_village',
                helpText: 'Current Village',
                group: 'person',
                requireNext: false,
                type: FieldType.TT_SELECT,
                condition: () => this.editConditionCheck(this.addressAttributes),
                validation: (val: any) => Validation.required(val),
                options: (form: any) => this.getVillages(form.current_traditional_authority.other.id)
            },
            {
                id: 'landmark',
                helpText: 'Closest Landmark or Plot Number',
                group: 'person',
                type: FieldType.TT_SELECT,
                condition: () => this.editConditionCheck(),
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
                ]),
            },
            {
                id: 'cell_phone_number',
                helpText: 'Cell phone number',
                group: 'person',
                type: FieldType.TT_NUMBER,
                preset: this.getFieldPreset('cell_phone_number'),
                condition: () => this.editConditionCheck(['cell_phone_number']),
                validation: (val: any) => {
                    if (val && val.value.match(/Unknown/i)) return

                    return Validation.isMWPhoneNumber(val)
                } 
            },
            {
                id: 'patient_type',
                helpText: 'Type of patient',
                group: 'person',
                type: FieldType.TT_SELECT,
                condition: () => this.editConditionCheck(['patient_type']) && this.showPatientType,
                validation: (val: any) => Validation.required(val),
                options: () => this.mapToOption([
                    'New patient',
                    'External consultation',
                ])
            },
            {
                id: 'location',
                helpText: 'Please select facility name',
                type: FieldType.TT_SELECT,
                group: 'person',
                validation: (val: any) => Validation.required(val),
                condition: (form: any) => this.editConditionCheck(['location']) && this.showPatientType && form.patient_type.label === 'External consultation',  
                options: (_, filter='') => this.getFacilities(filter),
                config: {
                    showKeyboard: true,
                    isFilterDataViaApi: true
                }
            },
            {
                id: 'occupation',
                helpText: 'Occupation',
                type: FieldType.TT_SELECT,
                group: 'person_attributes',
                condition: () => this.editConditionCheck(['occupation']) && this.isMilitarySite,
                validation: (val: any) => Validation.required(val),
                options: () => this.mapToOption([
                    'MDF Reserve',
                    'MDF Retired',
                    'Civilian'
                ])
            },
            {
                id: 'person_regiment_id',
                helpText: 'Regiment ID',
                type: FieldType.TT_NUMBER,
                group: 'person_attributes',
                condition: (form: any) => this.editConditionCheck(['person_regiment_id']) && form.occupation && form.occupation.value.match(/MDF/i),
                validation: (val: any) => Validation.required(val), 
            },
            {
                id: 'person_date_joined_military',
                helpText: 'Date joined MDF',
                type: FieldType.TT_TEXT,
                group: 'person_attributes',
                condition: (form: any) => this.editConditionCheck(['person_date_joined_military']) && form.occupation && form.occupation.value.match(/MDF/i),
                validation: (val: any) => Validation.required(val)
            },
            {
                id: 'rank',
                helpText: 'Rank',
                type: FieldType.TT_SELECT,
                group: 'person_attributes',
                validation: (val: any) => Validation.required(val),
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
            },
            {
                id: 'relationship',
                helpText: 'Register guardian?',
                type: FieldType.TT_SELECT,
                group: 'person',
                condition: () => this.editConditionCheck(),
                validation: (val: any) => Validation.required(val),
                options: () => this.mapToOption(['Yes', 'No'])
            }
        ]
    }
  },
})
</script>