import { FieldType } from "@/components/Forms/BaseFormElements"
import MonthOptions from "@/utils/HisFormHelpers/MonthOptions"
import { Field, Option } from "@/components/Forms/FieldInterface"
import HisDate from "@/utils/Date"
import StandardValidations from "@/components/Forms/validations/StandardValidations"

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
    required?: boolean;
    defaultValue?: Function;
    minDate?(formData: any, computeForm: any): string;
    maxDate?(formData: any, computeForm: any): string;
    unload?(data: any, state: string, formData: any,  computeForm: any): void; 
    computeValue: Function;
    appearInSummary?: Function;
    estimation: EstimationInterface;
    config?: any;
}

export function getYearField(id: string, name: string): Field {
    return {
        id,
        helpText: `${name} Year`,
        appearInSummary: () => false,
        type: FieldType.TT_NUMBER
    }
}

export function getMonthField(id: string, name: string): Field {
    return {
        id,
        helpText: `${name} Month`,
        appearInSummary: () => false,
        type: FieldType.TT_SELECT,
        options: () => MonthOptions
    }
}

export function getDayField(id: string, name: string): Field {
    return {
        id,
        helpText: `${name} Day`,
        type: FieldType.TT_MONTHLY_DAYS
    }
}

export function getMonthDurationEstimateField(id: string, name: string): Field {
    return {
        id,
        helpText: `${name} Estimated period`,
        type: FieldType.TT_SELECT,
        options: () => ([
            { label: '6 months ago', value: 180 },
            { label: '12 months ago', value: 365 },
            { label: '18 months ago', value: 540 },
            { label: '24 months ago', value: 730 },
            { label: 'Over 2 years ago', value: 730 }
        ])
    }
}

export function getAgeEstimateField(id: string, name: string): Field {
    return {
        id,
        helpText: `${name} Age Estimate`,
        type: FieldType.TT_NUMBER
    }
}

function appendLeadingZero(s: string) {
    return parseInt(s) < 10 ? `0${s}` : s
}

async function getDefaultDate(field: DateFieldInterface, datePart: 'Year' | 'Month' | 'Day') {
    if (field.defaultValue) {
        const date = await field.defaultValue()
        if (date) {
            const [year, month, day] = date.split('-')
            switch(datePart) {
                case 'Year':
                    return year || ''
                case 'Month':
                    return parseInt(month) || ''
                case 'Day':
                    return parseInt(day) || ''    
            }
        }
    }
    return ''
}

function validateMinMax(date: string, field: DateFieldInterface, form: any, computed: any) {
    if (field.minDate) {
        const min = field.minDate(form, computed)
        if (new Date(date) < new Date(min)) {
            return [`${date} is less than minimum date of ${min}`]
        }
    }
    if (field.maxDate) {
        const max = field.maxDate(form, computed)
        if (new Date(date) > new Date(max)) {
            return [`${date} is greater than max date of  ${max}`]
        }
    }
}

export function generateDateFields(field: DateFieldInterface, refDate=''): Array<Field> {
    let fullDate = ''
    let yearValue = ''
    let monthValue = ''
    let dayValue = ''

    const yearID = `year_${field.id}`
    const monthID = `month_${field.id}`
    const dayID = field.id
    const ageEstimateID = `age_estimate_${field.id}`
    const durationEstimateID = `duration_estimate_${field.id}`

    const year = getYearField(yearID, field.helpText)
    const month = getMonthField(monthID, field.helpText)
    const day = getDayField(dayID, field.helpText)

    const ageEstimate = getAgeEstimateField(ageEstimateID, field.helpText)
    const durationEstimate = getMonthDurationEstimateField(durationEstimateID, field.helpText)

    const datePartCondition = (f: any) => {
        if (f[yearID] && f[yearID].value 
            && f[yearID].value === 'Unknown') {
            return false
        }
        return field.condition ? field.condition(f) : true
    }

    year.unload = (v: Option) => yearValue = v.value.toString()
 
    // YEAR CONFIG
    year.config = field.config

    year.defaultValue = () => {
        return getDefaultDate(field, 'Year')
    }

    year.condition = (f: any) => {
        return field.condition ? field.condition(f) : true
    }

    year.validation = (v: Option) => {
        if (field.required && StandardValidations.required(v)) {
            return ['Year cannot be empty']
        }
        const year = v ? v.value : ''
        if (!field.estimation.allowUnknown 
            && year.toString().match(/unknown/i)) {
            return ['Value unknown is not permitted']
        }
        if (year && year !='Unknown'
            && isNaN(parseInt(year.toString()))
            || year < 1900) {
            return ['Invalid Year']
        }
        return null
    }

    // MONTH CONFIG
    month.unload = (v: Option) => monthValue = appendLeadingZero(v.value.toString())

    month.condition = (f: any) => {
        return datePartCondition(f)
    }

    month.validation = (v: Option) => {
        return StandardValidations.required(v)
    }

    // DAY CONFIG
    day.condition = (f: any) => {
        return datePartCondition(f) 
    }

    day.validation =  (v: Option, f: any, c: any) => {
        if (StandardValidations.required(v)) {
            return ['Day is required for date']
        }
        dayValue = appendLeadingZero(v.value.toString())
        fullDate = `${yearValue}-${monthValue}-${dayValue}`
        return validateMinMax(fullDate, field, f, c)
    }

    day.defaultValue = () => {
        return getDefaultDate(field, 'Year')
    }

    day.computedValue = () => {
        return field.computeValue(fullDate, false)
    }

    day.summaryMapValue = () => ({
        label: `${field.helpText} Date`,
        value: HisDate.toStandardHisDisplayFormat(fullDate)
    })

    const dayConf = field.config ? field.config : {}

    day.unload = (d: any, s: any, f: any, c: any) => {
        if (field.unload) {
            field.unload(d, s, f, c)
        }
    }

    day.config = { 
        keyboardActions: [],
        ...dayConf,
        year: (f: any) => f[yearID].value,
        month: (f: any) => f[monthID].value 
    }

    const validateValueEstimate = (v: Option, f: any, c: any) => {
        if (StandardValidations.required(v)) {
            return ['Please select an estimate']
        }
        return validateMinMax(fullDate, field, f, c)
    }

    // AGE ESTIMATE CONFIG
    ageEstimate.validation = validateValueEstimate

    ageEstimate.condition = (f: any) => {
        const estimateType = field.estimation.estimationFieldType
        const conditions = [
            f[yearID].value === 'Unknown',
            field.condition ? field.condition(f) : true,
            estimateType === EstimationFieldType.AGE_ESTIMATE_FIELD
        ]
        return conditions.every(Boolean)
    }

    ageEstimate.computedValue = (val: Option) => {
        const [year] = HisDate.estimateDateFromAge(
            parseInt(val.value.toString()
        )).split('-')
        fullDate = `${year}-07-15`
        return field.computeValue(fullDate, true)
    }

    ageEstimate.summaryMapValue = ({ label }: Option) => ({ 
        label: `${field.helpText} Date Estimate`,
        value: `${label} (${HisDate.toStandardHisDisplayFormat(fullDate)})`
    })

    // DURATION ESTIMATE
    durationEstimate.validation = validateValueEstimate

    durationEstimate.condition = (f: any) => {
        const estimateType = field.estimation.estimationFieldType
        const conditions = [
            f[yearID].value === 'Unknown',
            field.condition ? field.condition(f) : true,
            estimateType === EstimationFieldType.MONTH_ESTIMATE_FIELD
        ]
        return conditions.every(Boolean)
    }

    durationEstimate.computedValue = (val: Option) => {
        const [year] = HisDate.getDateBeforeByDays(
            refDate, parseInt(val.value.toString()
        )).split('-')
        fullDate = `${year}-07-15`
        return field.computeValue(fullDate, true)
    }

    durationEstimate.summaryMapValue = ({ label }: Option) => ({ 
        label: `${field.helpText} Date Estimate`,
        value: `${label} (${HisDate.toStandardHisDisplayFormat(fullDate)})`
    })

    return [
        year,
        month,
        day,
        ageEstimate,
        durationEstimate
    ]
}
