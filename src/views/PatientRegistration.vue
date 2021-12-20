<template>
  <ion-page>
    <his-standard-form
        @onIndex="fieldComponent=''"
        :skipSummary="skipSummary"
        :activeField="fieldComponent"
        :fields="fields"
        :onFinishAction="onFinish"
    />
  </ion-page>
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
import { WorkflowService } from "@/services/workflow_service"
import { isPlainObject, isEmpty } from "lodash"
import PersonField from "@/utils/HisFormHelpers/PersonFieldHelper"
import { PatientRegistrationService } from "@/services/patient_registration_service"
import App from "@/apps/app_lib"
import { AppInterface } from "@/apps/interfaces/AppInterface"
import { nextTask } from "@/utils/WorkflowTaskHelper"
import { isValueEmpty } from "@/utils/Strs"
import { PatientDemographicsExchangeService } from "@/services/patient_demographics_exchange_service"
import { toastWarning } from "@/utils/Alerts"
import { PatientTypeService } from "@/apps/ART/services/patient_type_service";
import { IonPage } from "@ionic/vue"
import { infoActionSheet } from "@/utils/ActionSheets"

export default defineComponent({
  components: { HisStandardForm, IonPage },
  data: () => ({
    app: App.getActiveApp() as AppInterface,
    ddeInstance: {} as any,
    ddeDocID: '' as string,
    ddeIsReassign: false as boolean,
    skipSummary: false as boolean,
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
    hasIncompleteData: false as boolean,
    patient: {} as any,
    editPersonData: {} as any,
    editPerson: -1 as number,
    activeField: '' as string,
    fieldComponent: '' as string,
    fields: [] as Array<Field>,
    isMilitarySite: false,
    presets: {} as any,
    form: {} as Record<string, Option> | Record<string, null>
  }),
  watch: {
    '$route': {
        async handler({query}: any) {
           this.ddeInstance = new PatientDemographicsExchangeService()
           await this.ddeInstance.loadDDEStatus()
           if (query.edit_person) {
                this.ddeIsReassign = query.dde_reassign
                this.ddeDocID = query.doc_id
                this.ddeInstance.setPatientID(query.edit_person)
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
        fields.push(this.possibleDuplicatesField())
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
        this.patient = new Patientservice(person)
        const {
            ancestryDistrict,
            ancestryTA,
            ancestryVillage,
            currentDistrict,
            currentTA
        } = this.patient.getAddresses()
        this.editPersonData = {
            'given_name': this.patient.getGivenName(),
            'family_name': this.patient.getFamilyName(),
            'gender': this.patient.getGender(),
            'birthdate': this.patient.getBirthdate(),
            'home_district': ancestryDistrict,
            'home_traditional_authority': ancestryTA,
            'home_village': ancestryVillage,
            'current_district': currentDistrict,
            'current_traditional_authority': currentTA,
            'cell_phone_number': this.patient.getPhoneNumber(),
        }
        this.presets = this.editPersonData
        this.skipSummary = true
    },
    async onFinish(form: Record<string, Option> | Record<string, null>, computedData: any) {
        if (!this.isEditMode()) {
            return this.create(form, computedData)
        } else {
            return this.update(computedData)
        }
    },
    async create(_: any, computedData: any) {
        const person: any = PersonField.resolvePerson(computedData)
        const attributes: Array<any> = this.resolvePersonAttributes(computedData)
        const registration: any = new PatientRegistrationService()
        await registration.registerPatient(person, attributes)

        const patientID = registration.getPersonID()

        if (this.app.onRegisterPatient) {
            const exit = await this.app.onRegisterPatient(
                patientID, person, attributes, this.$router
            )
            if (exit) return
        }
        if (person.relationship === 'Yes') {
            return this.$router.push(`/guardian/registration/${patientID}`)
        }
        await nextTask(patientID, this.$router)
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
    confirmPatient() {
        if (!this.patient.getNationalID().match(/unknown/i)) {
            return  this.$router.push(`/patients/confirm?patient_barcode=${this.patient.getNationalID()}`)
        }
        this.$router.push(`/patients/confirm?person_id=${this.patient.getID()}`)
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
        gender.beforeNext = async (data: Option) => {
            /**
             * Provide warning when changing gender in edit mode
            */
            const newGender = data.value
            const oldGender = this.presets.gender
            if (this.isEditMode() && newGender != oldGender) {
                const action = await infoActionSheet(
                    'Warning',
                    `Changing gender from ${oldGender} to ${newGender}`,
                    "This change will cause data inconsistency and will affect alot of Reports.",
                    [
                        {
                            name: 'Cancel', slot: 'start'
                        },
                        {
                            name: 'Change gender', slot: 'end', color: 'danger'
                        }
                    ]
                )
                return action === 'Change gender'
            }
            return true
        }
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
        homeTA.condition = (form: any) => this.editConditionCheck(this.addressAttributes)
            && !form.home_region.label.match(/foreign/i)
        return homeTA
    },
    homeVillageField(): Field {
        const homeVillage: Field = PersonField.getHomeVillageField()
        homeVillage.condition = (form: any) => this.editConditionCheck(this.addressAttributes)
            && !form.home_region.label.match(/foreign/i)
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
        currentTA.condition = (form: any) => this.editConditionCheck(this.addressAttributes)
            && !form.current_region.label.match(/foreign/i)
        return currentTA
    },
    currentVillage(): Field {
        const currentVillage: Field = PersonField.getCurrentVillageField()
        currentVillage.condition = (form: any) => this.editConditionCheck(this.addressAttributes)
            && !form.current_region.label.match(/foreign/i)
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
       facility.condition = (form: any) => [
           'Drug Refill',
           'External consultation'
       ].includes(form.patient_type.value)
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
            condition: () => this.editConditionCheck(['patient_type'])
                && this.app.applicationName === 'ART',
            validation: (val: any) => Validation.required(val),
            options: () => PatientTypeService.getPatientTypes()
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
                    'person_attribute_type_id': 37, 'value': date
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
                const payload = {
                    'given_name': form.given_name.value,
                    'family_name': form.family_name.value,
                    'gender': form.gender.value
                }
                // DDE enabled search
                if (this.ddeInstance.isEnabled()) {
                    const patients = await this.ddeInstance.searchDemographics(payload)
                    return patients.map((item: any) => {
                        const itemData = PersonField.getPersonAttributeOptions(item)
                        itemData.other.options.push({
                            label: 'Patient Type',
                            value: item.patient_type
                        })
                        itemData.other.options.push({
                            label: 'Doc ID',
                            value: item.doc_id
                        })
                        return itemData
                    })
                }
                // Regular search
                const patients = await Patientservice.search(payload);
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
                            let searchParam = ''
                            const npid = form?.results?.other?.npid 
                            if (npid && !isValueEmpty(npid)) {
                                searchParam = `patient_barcode=${npid}`
                            } else {
                                searchParam = `person_id=${form.results.value}`
                            }
                            return this.$router.push(`/patients/confirm?${searchParam}`)
                        }
                    }
                ]
            }
        }
    },
    possibleDuplicatesField(): Field {
        let createdPerson: any = {}
        let duplicatePatients: any = {}
        return {
            id: 'possible_duplicates',
            helpText: 'Possible Duplicate(s)',
            type: FieldType.TT_PERSON_MATCH_VIEW,
            condition: async (_: any, c: any) => {
                if (this.ddeInstance.isEnabled() && !this.editPerson) {
                    createdPerson = PersonField.resolvePerson(c)
                    duplicatePatients = await this.ddeInstance
                        .checkPotentialDuplicates(createdPerson)
                    return duplicatePatients.length >= 1
                }
                return false
            },
            options: async () => {
                const toDate = (date: string) => HisDate.toStandardHisDisplayFormat(date)
                return duplicatePatients.map(({ score, person }: any) => {
                    const name = `${person.given_name} ${person.family_name}`
                    return {
                        label: name,
                        value: person.patient_id,
                        other: {
                            score: `${score * 100}%`,
                            newPerson: createdPerson,
                            foundPerson: person,
                            comparisons: [
                                [
                                    'Name',
                                    `${createdPerson.given_name} ${createdPerson.family_name}`,
                                    `${person.given_name} ${person.family_name}`
                                ],
                                [
                                    'Gender',
                                    createdPerson.gender,
                                    person.gender
                                ],
                                [
                                    'Birthdate',
                                    toDate(createdPerson.birthdate),
                                    toDate(person.birthdate)
                                ],
                                [
                                    'Home District',
                                    createdPerson.home_district,
                                    person.home_district
                                ],
                                [
                                    'Home TA',
                                    createdPerson.home_traditional_authority,
                                    person.home_traditional_authority
                                ]
                            ]
                        }
                    }
                })
            },
            config: {
                hiddenFooterBtns: [
                    'Clear',
                    'Next'
                ],
                footerBtns: [
                    {
                        name: 'Not Duplicate',
                        slot: 'start',
                        state: {
                            visible: {
                                default: () => false,
                                onValue: (_: any, f: any) => !isEmpty(f.possible_duplicates)
                            }
                        },
                        onClick: () => {
                            this.fieldComponent = '_NEXT_FIELD_'
                        }
                    },
                    {
                        name: 'Confirm',
                        slot: 'end',
                        color: 'warning',
                        state: {
                            visible: {
                                default: () => false,
                                onValue: (_: any, f: any) => !isEmpty(f.possible_duplicates)
                            }
                        },
                        onClick: (form: any) => {
                            this.$router.push(`/patients/confirm?person_id=${form.possible_duplicates.value}`)
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
            condition: () => this.editPerson != -1,
            options: async () => {
                const editButton = (attribute: string) => ({
                    name: 'Edit',
                    type: 'button',
                    action: () => {
                        this.activeField = attribute
                        this.fieldComponent = this.activeField
                    }
                })
                const columns = ['Attributes', 'Values', 'Edit']
                const rows = [
                    ['Given Name', this.editPersonData.given_name, editButton('given_name')],
                    ['Family Name', this.editPersonData.family_name, editButton('family_name')],
                    ['Gender', this.editPersonData.gender,  editButton('gender')],
                    ['Birthdate', HisDate.toStandardHisDisplayFormat(this.editPersonData.birthdate),  editButton('year_birth_date')],
                    ['Cell Phone Number', this.editPersonData.cell_phone_number, editButton('cell_phone_number')],
                    ['Current district',this.editPersonData.current_district, editButton('home_region')],
                    ['Current T/A', this.editPersonData.current_traditional_authority, editButton('home_region')],
                    ['Home District', this.editPersonData.home_district, editButton('home_region')],
                    ['Home TA', this.editPersonData.home_traditional_authority,  editButton('home_region')],
                    ['Home Village', this.editPersonData.home_village,  editButton('home_region')],
                ]
                // Tag rows with empty values
                const emptySets: any = {indexes: [], class: 'his-empty-set-color'}
                rows.forEach((r: any, i: number) => {
                    if (isValueEmpty(r[1])) 
                        emptySets.indexes.push(i)
                })
                this.hasIncompleteData = emptySets.indexes.length >= 1
                return [{
                    label: '', 
                    value: '',
                    other: {
                        rows,
                        columns,
                        rowColors: [emptySets]
                    }
                }]
            },
            config: {
                footerBtns: [
                    /**
                     * Custom button that Appears when DDE wants to
                     * Reassign a patient with incomplete data
                    */
                    {
                        name: 'Reassign',
                        slot: 'end',
                        color: 'success',
                        state: {
                            visible: {
                                default: () => false,
                                onload: () => (
                                    this.ddeInstance.isEnabled()
                                    && this.ddeIsReassign
                                    && !this.hasIncompleteData
                                )
                            }
                        },
                        onClick: async () => {
                            try {
                                await this.ddeInstance.reassignNpid(this.ddeDocID, this.editPerson)
                                await this.ddeInstance.printNpid()
                                this.confirmPatient()
                            } catch(e) {
                                toastWarning(e)
                            }
                        }
                    },
                    /**
                     * Custom button that redirects to patient confirmation page
                     */
                    {
                        name: 'Confirm',
                        slot: 'end',
                        color: 'warning',
                        state: {
                            visible: {
                                onload: () => !this.ddeIsReassign && !this.hasIncompleteData
                            }
                        },
                        onClick: () => this.confirmPatient()
                    }
                ],
                hiddenFooterBtns: ['Clear', 'Next']
            }
        }
    },
  }
})
</script>