import { FieldType } from "@/components/Forms/BaseFormElements"
import MonthOptions from "@/components/FormElements/Presets/MonthOptions"
import { Field, Option } from "@/components/Forms/FieldInterface"
import Validation from "@/components/Forms/validations/StandardValidations"
import HisDate from "@/utils/Date"

export interface DateFieldInterface {
    id: string;
    helpText: string;
    condition?: Function;
    validation?: Function;
    computeValue: Function;
    appearInSummary?: Function;
    allowEstimationField?: boolean;
    allowUnknown?: boolean;
}

function onValidation(
    datePart: 'year' | 'month' | 'day', 
    field: DateFieldInterface, 
    val: Option, 
    formData: any, 
    computedFormData: any) {

    const validate = (data: any) => field.validation ? field.validation(data, formData, computedFormData) : true

    if (!val) {
        // Let any custom validation deal with null values
        return validate(val)
    }

    if (val.value.toString().match(/unknown/i)) {
        if ('allowUnknown' in field && !field.allowUnknown) {
            return ['Unknown value not permitted']
        }
        //If year is unknown, treat the whole date as unknown and dont do anything here
        if (datePart === 'year') return null
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
    const canShowEstimateField = field.allowEstimationField ? field.allowEstimationField : false

    return [
        {
            id: yearId,
            helpText: `${field.helpText} Year`,
            type: FieldType.TT_NUMBER,
            appearInSummary: () => false,
            condition: (f: any) => field.condition ? field.condition(f) : true,
            validation: (v: Option, f: any, c: any) => onValidation('year', field, v, f, c)
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
                    canShowEstimateField,
                    f[yearId].value === 'Unknown',
                    field.condition ? field.condition(f): true
                ]
                return conditions.every(Boolean)
            },
            computedValue: ({ value }: Option) => {
                const date = HisDate.getDateBeforeByDays(
                    currentDate, parseInt(value.toString())
                )
                return field.computeValue(date, true)
            },
            options: () => ([
                { label: '6 months ago', value: 180 },
                { label: '12 months ago', value: 365 },
                { label: '18 months ago', value: 540 },
                { label: '24 months ago', value: 730 },
                { label: 'Over 2 years ago', value: 730 }
            ])
        }
    ]
}
