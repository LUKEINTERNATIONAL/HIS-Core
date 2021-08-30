import { FieldType } from "@/components/Forms/BaseFormElements"
import MonthOptions from "@/components/FormElements/Presets/MonthOptions"
import { Field, Option } from "@/components/Forms/FieldInterface"
import HisDate from "@/utils/Date"
import { isEmpty } from "lodash"

export enum EstimationFieldType {
    AGE_ESTIMATE_FIELD = "age-estimate-field",
    MONTH_ESTIMATE_FIELD = "month-period-estimate-field"
}

export interface EstimationInterface {
    estimationFieldType?: EstimationFieldType;
    allowUnknown: boolean; 
}

export interface DateFieldInterface {
    id: string;
    helpText: string;
    condition?: Function;
    validation?: Function;
    required?: boolean;
    minDate?(formData: any): string;
    maxDate?(formData: any): string;
    computeValue: Function;
    appearInSummary?: Function;
    estimation: EstimationInterface;
    config?: any;
}

function getDateConfig(field: DateFieldInterface) {
    return {
        isUnknown: false,
        builtDate: '',
        isEstimated: false,
        year: {
            id: `year_${field.id}`,
            type: 'year',
            isEstimate: false,
            estimateValue: '',
            value: '',
        },
        month: {
            id: `month_${field.id}`,
            value: '01',
            type: 'month',
            isEstimate: true,
            defaultEstimateValue: '07',
        },
        day: {
            id: field.id,
            value: '01',
            type: 'day',
            isEstimate: true,
            defaultEstimateValue: '15',
        }
    }
}

function hasEstimates(dateConfig: any) {
    return Object.values(dateConfig)
                .map((d: any) => d.isEstimate ? d.defaultEstimateValue : d.value )
                .join('-')
}

function buildDate(dateConfig: any) {
    return Object.values(dateConfig)
                .filter((d: any) => typeof d === 'object' && ['day', 'year', 'month'].includes(d.type))
                .map((d: any) => d.isEstimate ? d.defaultEstimateValue : d.value )
                .join('-')
}

function formatDigit(s: string) {
    return parseInt(s) < 10 ? `0${s}` : s
}

function onValidation(
    datePart: any,
    dateConfig: any,
    val: Option,
    formData: any,
    computedFormData: any,
    field: DateFieldInterface) {
    /**
     * Run any custom validations defined in the field
     * @param data 
     * @returns 
     */
    const customValidation = (data: any) => {
        return field.validation ? field.validation(data, formData, computedFormData) : null
    } 
    /**
     * Since the date is entered on seperate fields and not
     * all parts of a date can be available, the function below fills
     * in the missing parts using a reference date inorder to build 
     * a complete date.
     * @param refDate 
     * @returns 
     */
    const getInputDate = (refDate: string) => {
        const {year, day, month} = dateConfig 
        const [_, refM, refD] = refDate.split('-')

        let inputDate = `${year.value}`
        
        if (month.isEstimate) {
            inputDate += `-${refM}`
        } else {
            inputDate += `-${month.value}`
        }
        if (day.isEstimate) {
            inputDate += `-${refD}`
        } else {
            inputDate += `-${day.value}`
        }
        return inputDate
    } 

    const validateMinMax = (date: string) => {
        if (field.minDate) {
            const minDate = field.minDate(formData)
            if (new Date(date) < new Date(minDate)) {
                return [`Date is less than minimum date of ${HisDate.toStandardHisDisplayFormat(minDate)}`]
            }
        }
        if (field.maxDate) {
            const maxDate = field.maxDate(formData)
            if (new Date(date) > new Date(maxDate)) {
                return [`Date is greater than max date of ${HisDate.toStandardHisDisplayFormat(maxDate)}`]
            }
        }
        return null
    }

    if (isEmpty(val) || val.value === '') { 
        if (field.required) {
            return ['Date value should not be empty']
        }
        return customValidation(val)
    }

    if (typeof datePart === 'object') {
        if (datePart.type === 'year') {
            if ('allowUnknown' in field.estimation){
                if (!field.estimation.allowUnknown && val.value.toString().match(/unknown/i)) {
                    return ['Unknown is not allowed']
                }
            }
            if (parseInt(datePart.value) < 1900) {
                return ['Invalid Year!']
            }
        }
        if (isEmpty(datePart)) {
            const issueFound = validateMinMax(dateConfig.builtDate)
            if (issueFound) return issueFound
        } else {
            if (field.minDate) {
                const issuesFound = validateMinMax(getInputDate(field.minDate(formData)))
                if (issuesFound) return issuesFound
            }
            if (field.maxDate) {
                const issuesFound = validateMinMax(getInputDate(field.maxDate(formData)))
                if (issuesFound) return issuesFound
            }
        }
    }
    return customValidation({ label: val.label, value: dateConfig.builtDate })
}

function onCondition(field: DateFieldInterface, formData: any) {
    if (formData[`year_${field.id}`].value === 'Unknown') {
        return false
    }
    return field.condition ? field.condition(formData): true 
}

export function generateDateFields(field: DateFieldInterface, currentDate=''): Array<Field>{
    const dateConfig: any = getDateConfig(field)
    dateConfig.day.id = field.id
    dateConfig.month.id = `month_${field.id}`
    dateConfig.year.id = `year_${field.id}`
    return [
        {
            id: dateConfig.year.id,
            helpText: `${field.helpText} Year`,
            type: FieldType.TT_NUMBER,
            appearInSummary: () => false,
            condition: (f: any) => field.condition ? field.condition(f) : true,
            validation: (v: Option, f: any, c: any) => {
                if (v) {
                    dateConfig.day.isEstimate = true
                    dateConfig.month.isEstimate = true
                    if (v.value != 'Unknown') {
                        dateConfig.year.value =  v.value.toString()
                        dateConfig.isUnknown = false
                        dateConfig.builtDate = buildDate(dateConfig)
                    } else {
                        dateConfig.isUnknown = true                      
                    }
                }
                return onValidation(dateConfig.year, dateConfig, v, f, c, field)
            },
            config: field.config
        },
        {
            id: dateConfig.month.id,
            helpText: `${field.helpText} Month`,
            type: FieldType.TT_SELECT,
            appearInSummary: () => false,
            options: () => MonthOptions,
            condition: (f: any) => onCondition(field, f),
            validation: (v: Option, f: any, c: any) => {
                if (v) {
                    dateConfig.day.isEstimate = true
                    dateConfig.month.value = formatDigit(v.value.toString())
                    dateConfig.month.isEstimate = false
                    dateConfig.builtDate = buildDate(dateConfig)
                }
                return onValidation(dateConfig.month, dateConfig, v, f, c, field)
            }
        },
        {
            id: dateConfig.day.id,
            helpText: `${field.helpText} Day`,
            type: FieldType.TT_MONTHLY_DAYS,
            condition: (f: any) => onCondition(field, f),
            appearInSummary: (f: any) => {
                return field.appearInSummary ? field.appearInSummary(f): true
            },
            summaryMapValue: (_: Option, f: any, computed: Record<string, any>) => ({
                label: `${field.helpText} Date`,
                value: `${computed.date} ${computed.isEstimate ? '(Estimated Date)': ''}`
            }),
            validation: (v: Option, f: any, c: any) => {
                if (v) {
                    dateConfig.day.value = formatDigit(v.value.toString())
                    dateConfig.builtDate = buildDate(dateConfig)
                    dateConfig.day.isEstimate = false
                }
                return onValidation(dateConfig.day, dateConfig, v, f, c, field)
            },
            computedValue: (v: Option) => {
                /** This duplication is a necessary evil when saving dates */
                if (v) {
                    dateConfig.day.value = formatDigit(v.value.toString())
                    dateConfig.builtDate = buildDate(dateConfig)
                    dateConfig.day.isEstimate = false
                }
                return field.computeValue(dateConfig.builtDate, hasEstimates)
            },
            config: {
                keyboardActions: []
            }
        },
        {
            id: `estimated_${field.id}`,
            helpText: `${field.helpText} Estimated period`,
            type: FieldType.TT_SELECT,
            summaryMapValue: ({ label }: Option, f: any, computedValue: any) => ({ 
                label: `${field.helpText} Date Estimate`,
                value: `${label} (${computedValue.date})`
            }),
            condition: (f: any) => {
                const conditions = [
                    field.estimation.estimationFieldType === EstimationFieldType.MONTH_ESTIMATE_FIELD,
                    dateConfig.isUnknown,
                    field.condition ? field.condition(f): true
                ]
                return conditions.every(Boolean)
            },
            computedValue: (val: any) =>{
                if (val) {
                    const [year] = HisDate.getDateBeforeByDays(currentDate, parseInt(val.value.toString())).split('-')
                    dateConfig.builtDate = `${year}-07-15`
                }
                return field.computeValue(dateConfig.builtDate, true)
            },
            options: () => ([
                { label: '6 months ago', value: 180 },
                { label: '12 months ago', value: 365 },
                { label: '18 months ago', value: 540 },
                { label: '24 months ago', value: 730 },
                { label: 'Over 2 years ago', value: 730 }
            ]),
            validation: (v: Option, f: any, c: any) => {
                if (v) {
                    const [year] = HisDate.getDateBeforeByDays(currentDate, parseInt(v.value.toString())).split('-')
                    dateConfig.builtDate = `${year}-07-15`
                }
                return onValidation({}, dateConfig, v, f, c, field) 
            }
        },
        {
            id: `age_estimate_${field.id}`,
            helpText: `${field.helpText} Age Estimate`,
            type: FieldType.TT_NUMBER,
            summaryMapValue: ({ label }: Option, f: any, computedValue: any) => ({ 
                label: `${field.helpText} Date Estimate`,
                value: `${label} (${computedValue.date})`
            }),
            computedValue: (v: any) => {
                if (v) {
                    const [year] = HisDate.estimateDateFromAge(parseInt(v.value.toString())).split('-')
                    dateConfig.builtDate = `${year}-07-15`
                    field.computeValue(dateConfig.builtDate , true)
                }
            },
            condition: (f: any) => {
                const conditions = [
                    field.estimation.estimationFieldType === EstimationFieldType.AGE_ESTIMATE_FIELD,
                    dateConfig.year.isEstimate,
                    field.condition ? field.condition(f): true
                ]
                return conditions.every(Boolean)
            },
            validation: (v: Option, f: any, c: any) => {
                if (v) {
                    const [year] = HisDate.estimateDateFromAge(parseInt(v.value.toString())).split('-')
                    dateConfig.builtDate = `${year}-07-15`
                }
                return onValidation({}, dateConfig, v, f, c, field)
            },
        }
    ]
}
