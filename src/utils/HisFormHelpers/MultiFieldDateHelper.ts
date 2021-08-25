import { FieldType } from "@/components/Forms/BaseFormElements"
import MonthOptions from "@/components/FormElements/Presets/MonthOptions"
import { Field, Option } from "@/components/Forms/FieldInterface"
import Validation from "@/components/Forms/validations/StandardValidations"
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
    minDate?(): string;
    maxDate?(): string;
    computeValue: Function;
    appearInSummary?: Function;
    estimation: EstimationInterface;
    config?: any;
}

function validateFieldParams(field: DateFieldInterface, val: Option) {
    if (field.required && isEmpty(val)) {
        return ['Date is required']
    }
    if (field.minDate) {
        const minDate = field.minDate()
        if (new Date(val.value) < new Date(minDate)) {
            return [`Date is less than minimum of ${minDate}`]
        }
        console.log(new Date(val.value) < new Date(minDate), val.value, minDate)
    }
    if (field.maxDate) {
        const maxDate = field.maxDate()
        if (new Date(val.value) > new Date(maxDate)) {
            return [`Date is more than maximum date of ${maxDate}`]
        }
    }
    return null
}

function runValidations(field: DateFieldInterface, value: Option, formData: any, computedFormData: any) {
    const paramsValidation = validateFieldParams(field, value)
    if (paramsValidation) {
        return paramsValidation
    } 
    return field.validation ? field.validation(value, formData, computedFormData) : null
}

function onValidation(
    datePart: 'year' | 'month' | 'day', 
    field: DateFieldInterface, 
    val: Option,
    formData: any,
    computedFormData: any) {

    const validate = (data: any) => runValidations(field, data, formData, computedFormData)

    // Let any custom validation deal with null values
    if (isEmpty(val)) return validate(val)

    if (val.value.toString().match(/unknown/i)) {
        if (!field.estimation.allowUnknown) {
            return ['Unknown value not permitted']
        }
        //If year is unknown, treat the whole date as unknown and dont do anything here
        if (datePart.match(/year/)) return null
    }
    const getValue = (type: string) => {
        const id = type === 'day' ? field.id : `${type}_${field.id}`
        return formData[id] ? formData[id].value : ''
    }
    const year = getValue('year')
    let month = ''
    let day = ''
    /**
     * Check date part and clear it's successor's value. 
     * This will allow us to validate current datePart individually
    */
    switch(datePart) {
        case 'year':
            month = ''
            day = ''
            break
        case 'month':
            month = getValue('month')
            day = ''
            break
        case 'day':
            month = getValue('month')
            day = getValue('day')
            break
    }
    return validate({
        label: val.label,
        value: HisDate.stitchDate(year, month, day)
    })
}

function onCondition(field: DateFieldInterface, formData: any) {
    if (formData[`year_${field.id}`].value === 'Unknown') {
        return false
    }
    return field.condition ? field.condition(formData): true 
}

export function generateDateFields(field: DateFieldInterface, currentDate=''): Array<Field>{
    const yearId = `year_${field.id}`
    const monthId = `month_${field.id}`
    return [
        {
            id: yearId,
            helpText: `${field.helpText} Year`,
            type: FieldType.TT_NUMBER,
            appearInSummary: () => false,
            condition: (f: any) => field.condition ? field.condition(f) : true,
            validation: (v: Option, f: any, c: any) => onValidation('year', field, v, f, c),
            config: field.config
        },
        {
            id: monthId,
            helpText: `${field.helpText} Month`,
            type: FieldType.TT_SELECT,
            appearInSummary: () => false,
            options: () => MonthOptions,
            condition: (f: any) => onCondition(field, f),
            validation: (v: Option, f: any, c: any) => onValidation('month', field, v, f, c)
        },
        {
            id: field.id,
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
            validation: (v: Option, f: any, c: any) => onValidation('day', field, v, f, c),
            computedValue: ({ value }: Option, f: Record<string, any>) => {
                const day = value
                let isEstimate = false
                const year = f[yearId].value
                const month = f[monthId].value
                const date =  HisDate.stitchDate(year, month, day)

                if (month === 'Unknown' || day === 'Unknown') isEstimate = true

                return field.computeValue(date, isEstimate)
            }
        },
        {
            id: `estimated_${field.id}`,
            helpText: `${field.helpText} Estimated period`,
            type: FieldType.TT_SELECT,
            validation: (v: Option) => Validation.required(v),
            summaryMapValue: ({ label }: Option, f: any, computedValue: any) => ({ 
                label: `${field.helpText} Date Estimate`,
                value: `${label} (${computedValue.date})`
            }),
            condition: (f: any) => {
                const conditions = [
                    field.estimation.estimationFieldType === EstimationFieldType.MONTH_ESTIMATE_FIELD,
                    f[yearId].value === 'Unknown',
                    field.condition ? field.condition(f): true
                ]
                return conditions.every(Boolean)
            },
            computedValue: ({ value }: Option) => {
                const date = HisDate.getDateBeforeByDays(currentDate, parseInt(value.toString()))
                return field.computeValue(date, true)
            },
            options: () => ([
                { label: '6 months ago', value: 180 },
                { label: '12 months ago', value: 365 },
                { label: '18 months ago', value: 540 },
                { label: '24 months ago', value: 730 },
                { label: 'Over 2 years ago', value: 730 }
            ])
        },
        {
            id: `age_estimate_${field.id}`,
            helpText: `${field.helpText} Age Estimate`,
            type: FieldType.TT_NUMBER,
            summaryMapValue: ({ label }: Option, f: any, computedValue: any) => ({ 
                label: `${field.helpText} Date Estimate`,
                value: `${label} (${computedValue.date})`
            }),
            computedValue: ({ value }: Option) => {
                const date = HisDate.estimateDateFromAge(parseInt(value.toString()))
                // We want to get default estimate month and day that the function below provides... 
                // DON NOT GENERATE JUST ANY OTHER DAY AND MONTH.. JUST YEAR
                const estimateDate = HisDate.stitchDate(new Date(date).getFullYear())
                return field.computeValue(estimateDate, true)
            },
            condition: (f: any) => {
                const conditions = [
                    field.estimation.estimationFieldType === EstimationFieldType.AGE_ESTIMATE_FIELD,
                    f[yearId].value === 'Unknown',
                    field.condition ? field.condition(f): true
                ]
                return conditions.every(Boolean)
            },
            validation: (v: Option) => Validation.required(v) || Validation.isNumber(v),
        },
    ]
}
