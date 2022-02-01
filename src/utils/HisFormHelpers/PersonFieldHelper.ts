import {
    getFacilities,
    getRegions,
    getDistricts,
    getTraditionalAuthorities,
    getVillages
} from '@/utils/HisFormHelpers/LocationFieldOptions'
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Field, Option } from "@/components/Forms/FieldInterface"
import Validation from "@/components/Forms/validations/StandardValidations"
import {PersonService} from "@/services/person_service"
import { EstimationFieldType } from "@/utils/HisFormHelpers/MultiFieldDateHelper"
import HisDate from "@/utils/Date"
import { DateFieldInterface } from "@/utils/HisFormHelpers/MultiFieldDateHelper"
import { Patientservice } from "@/services/patient_service"
import { isPlainObject, isEmpty } from "lodash"
import { alertConfirmation, toastSuccess, toastWarning } from '../Alerts'
import { LocationService } from '@/services/location_service'

function mapToOption(listOptions: Array<string>): Array<Option> {
    return listOptions.map((item: any) => ({ 
        label: item, value: item 
    })) 
}
export default {
    resolvePerson(computedForm: any) {
        let data: any = {}
        for(const attr in computedForm) {
            const values = computedForm[attr]
            if (isPlainObject(values) && 'person' in values) {
                if (isPlainObject(values.person)) {
                    data = {...data, ...values.person}
                } else {
                    data[attr] = values['person']
                }
            }
        }
        return data   
    },
    getGivenNameField(): Field {
        return {
            id: 'given_name',
            helpText: 'First name',
            type: FieldType.TT_TEXT,
            computedValue: (val: Option) => ({person: val.value}),
            validation: (val: any) => Validation.isName(val),
            options: async (form: any) => {
                if (form.given_name) {
                    const names = await PersonService.searchGivenName(form.given_name.value)
                    return mapToOption(names)
                } 
                return []
            }
        }
    },
    getFamilyNameField(): Field {
        return {
            id: 'family_name',
            helpText: "Last name",
            type: FieldType.TT_TEXT,
            computedValue: (val: Option) => ({person: val.value}),
            validation: (val: any) => Validation.isName(val),
            options: async (form: any) => {
                if (form.family_name) {
                    const names = await PersonService.searchFamilyName(form.family_name.value)
                    return mapToOption(names)
                } 
                return []
            }
        }
    },
    getGenderField(): Field {
        return  {
            id: 'gender',
            helpText: 'Gender',
            type: FieldType.TT_SELECT,
            computedValue: (val: Option) => ({person: val.value}),
            validation: (val: any) => Validation.required(val),
            options: () => ([
                {
                    label: 'Female',
                    value: 'F'
                },
                { 
                    label: 'Male',
                    value: 'M'
                }
            ])
        }
    },
    getDobConfig(): DateFieldInterface {
        return  {
            id: 'birth_date',
            summaryLabel: 'Date of Birth',
            helpText: 'Birth',
            required: true,
            minYear: () => HisDate.getYearOfAge(100),
            minDate: () => HisDate.estimateDateFromAge(100),
            maxDate: () => PersonService.getSessionDate(),
            estimation: {
                allowUnknown: true,
                estimationFieldType: EstimationFieldType.AGE_ESTIMATE_FIELD
            },
            computeValue: (date: string, isEstimate: boolean) => {
                return {
                    date,
                    isEstimate,
                    person: {
                        birthdate: date,
                        'birthdate_estimated': isEstimate
                    }
                }
            }
        }
    },
    getHomeRegionField(): Field {
        return {
            id: 'home_region',
            helpText: 'Region of origin',
            type: FieldType.TT_SELECT,
            group: 'person',
            requireNext: false,
            computedValue: (val: Option) => ({person: val.label}),
            validation: (val: any) => Validation.required(val),
            options: () => getRegions()
        }
    },
    getHomeDistrictField() {
        return  {
            id: 'home_district',
            helpText: 'Home District',
            type: FieldType.TT_SELECT,
            requireNext: false,
            dynamicHelpText: (f: any) => {
                if (f.home_region && f.home_region.label.match(/foreign/i)) {
                    return 'Home Country'
                }
                return 'Home District'
            },
            computedValue: (val: Option) => ({person: val.label}),
            options: (form: any) => getDistricts(form.home_region.value)
        }
    },
    addCustomLocationBtnForTAorVillage(BtnName: string, formParentAddressRef: string) {
        return {
            name: `Add ${BtnName}`,
            slot: "end",
            color: "success",
            onClick: async (f: any, c: any, field: any) => {
                 if (typeof field.filter != 'string' || field.filter.length < 3) {
                    return toastWarning(`Please enter a valid ${BtnName}`)
                 }
                 if (!isEmpty(field.filtered)) {
                    return toastWarning(`Can't add existing ${BtnName}`)
                 } 
                 const ok = await alertConfirmation(`Do you want to add ${BtnName} ${field.filter}?`)

                 if (!ok) return

                 const address = await LocationService.createAddress(BtnName, field.filter, f[formParentAddressRef].value)
                 if (address) {
                    // Hack to force the list to reload the list with new data
                    field.filter = field.filter.toUpperCase() 
                 } else {
                    return toastWarning(`Unable to add ${BtnName}`)
                 }
            }
         }
    },
    getHomeTaField() {
        return  {
            id: 'home_traditional_authority',
            helpText: 'Home TA',
            type: FieldType.TT_SELECT,
            requireNext: false,
            config: {
                showKeyboard: true,
                isFilterDataViaApi: true,
                footerBtns: [
                    this.addCustomLocationBtnForTAorVillage('TA', 'home_district')
                ]
            },
            defaultOutput: () => ({label: 'N/A', value: 'N/A'}),
            defaultComputedOutput: (f: any) => {
                if (f.home_region && f.home_region.label.match(/foreign/i)) {
                    return { person: 'Unknown'}
                }
                return null
            },
            computedValue: (val: Option) => ({person: val.label}),
            validation: (val: any) => Validation.required(val),
            options: (form: any, filter: string) => getTraditionalAuthorities(form.home_district.value, filter)
        }
    },
    getHomeVillageField() {
        return {
            id: 'home_village',
            helpText: 'Home Village',
            type: FieldType.TT_SELECT,
            config: {
                showKeyboard: true,
                isFilterDataViaApi: true,
                footerBtns: [
                    this.addCustomLocationBtnForTAorVillage('Village', 'home_traditional_authority')
                ]
            },
            requireNext: false,
            defaultOutput: () => ({ label: 'N/A', value: 'N/A' }),
            defaultComputedOutput: (f: any) => {
                if (f.home_region && f.home_region.label.match(/foreign/i)) {
                    return { person: 'Unknown'}
                }
                return null
            },
            computedValue: (val: Option) => ({person: val.label}),
            validation: (val: any) => Validation.required(val),
            options: (form: any, filter: string) => getVillages(form.home_traditional_authority.value, filter)
        }
    },
    getCurrentRegionField() {
        return {
            id: 'current_region',
            helpText: 'Current Region',
            requireNext: false,
            type: FieldType.TT_SELECT,
            computedValue: (val: Option) => ({person: val.label}),
            validation: (val: any) => Validation.required(val),
            options: () => getRegions()
        }
    },
    getCurrentDistrictField() {
        return {
            id: 'current_district',
            helpText: 'District',
            requireNext: false,
            type: FieldType.TT_SELECT,
            dynamicHelpText: (f: any) => {
                if (f.current_region && f.current_region.label.match(/foreign/i)) {
                    return 'Current Country'
                }
                return 'Current District'
            },
            computedValue: (val: Option) => ({person: val.label}),
            validation: (val: any) => Validation.required(val),
            options: (form: any) => getDistricts(form.current_region.value)
        }
    },
    getCurrentTAfield() {
        return    {
            id: 'current_traditional_authority',
            helpText: 'Current TA',
            requireNext: false,
            type: FieldType.TT_SELECT,
            config: {
                showKeyboard: true,
                isFilterDataViaApi: true,
                footerBtns: [
                    this.addCustomLocationBtnForTAorVillage('TA', 'current_district')
                ]
            },
            defaultOutput: () => ({label: 'N/A', value: 'N/A'}),
            defaultComputedOutput: (f: any) => {
                if (f.current_region && f.current_region.label.match(/foreign/i)) {
                    return { person: 'Unknown'}
                }
                return null
            },
            computedValue: (val: Option) => ({person: val.label}),
            validation: (val: any) => Validation.required(val),
            options: (form: any, filter: string) => getTraditionalAuthorities(form.current_district.value, filter)
        }
    },
    getCurrentVillageField() {
        return {
            id: 'current_village',
            helpText: 'Current Village',
            requireNext: false,
            type: FieldType.TT_SELECT,
            config: {
                showKeyboard: true,
                isFilterDataViaApi: true,
                footerBtns: [
                    this.addCustomLocationBtnForTAorVillage('Village', 'current_traditional_authority')
                ]
            },
            defaultOutput: () => ({label: 'N/A', value: 'N/A'}),
            defaultComputedOutput: (f: any) => {
                if (f.current_region && f.current_region.label.match(/foreign/i)) {
                    return { person: 'Unknown'}
                }
                return null
            },
            computedValue: (val: Option) => ({person: val.label}),
            validation: (val: any) => Validation.required(val),
            options: (form: any, filter: string) => getVillages(form.current_traditional_authority.value, filter)
        }
    },
    getCellNumberField() {
        return   {
            id: 'cell_phone_number',
            helpText: 'Cell phone number',
            group: 'person',
            type: FieldType.TT_NUMBER,
            computedValue: (val: Option) => ({person: val.label}),
            validation: (val: any) => {
                if (val && (val.value.match(/Unknown/i) 
                    || val.value.match(/n\/a/i))) return

                return Validation.isMWPhoneNumber(val)
            },
            config: {
                noChars: false
            }
        }
    },
    getLandmarkFields(): Field[] {
        return [
            {
                id: 'default_landmarks',
                proxyID: 'landmark',
                helpText: 'Closest Landmark or Plot Number',
                type: FieldType.TT_SELECT,
                appearInSummary: (f: any) => f.default_landmarks.value != 'Other',
                computedValue: (val: Option) => ({person: val.value}),
                validation: (val: any) => Validation.required(val),
                options: () => mapToOption([
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
            },
            {
                id: 'other_landmark',
                proxyID: 'landmark',
                helpText: 'Closest Landmark or Plot Number',
                type: FieldType.TT_NOTE,
                condition: (f: any) => f.default_landmarks.value === 'Other',
                computedValue: (val: Option) => ({person: val.value}),
                validation: (v: Option) => Validation.required(v)
            }
        ]
    },
    getFacilityLocationField() {
        return  {
            id: 'location',
            helpText: 'Please select facility name',
            type: FieldType.TT_SELECT,
            computedValue: (val: Option) => ({person: val.label}),
            validation: (val: any) => Validation.required(val),
            options: (_: any, filter='') => getFacilities(filter),
            config: {
                showKeyboard: true,
                isFilterDataViaApi: true
            }
        }
    },
    getPersonAttributeOptions(person: any) {
        const patient = new Patientservice(person);
        const prop = (patient: any, prop: string) => prop in patient ? patient[prop]() : '-'
        return {
            label: patient.getPatientInfoString(),
            value: patient.getID() || patient.getNationalID(),
            other: {
                npid: patient.getNationalID(),
                person,
                options: [
                    {
                        label: "National ID",
                        value: prop(patient, 'getNationalID')
                    },
                    {
                        label: "Name",
                        value: prop(patient, 'getFullName'),
                    },
                    {
                        label: "Gender",
                        value: prop(patient, 'getGender'),
                    },
                    {
                        label: "Birthdate",
                        value: prop(patient, 'getBirthdate'),
                    },
                    {
                        label: "Home District",
                        value: prop(patient, 'getHomeDistrict'),
                    },
                    {
                        label: "Home Village",
                        value: prop(patient, 'getHomeVillage'),
                    },
                    {
                        label: "Current District",
                        value: prop(patient, 'getCurrentDistrict'),
                    },
                    {
                        label: "Current T/A",
                        value: prop(patient, 'getCurrentTA'),
                    }
                ]
            }
        }    
    }
}