import { FieldType } from "@/components/Forms/BaseFormElements"
import MonthOptions from "@/utils/HisFormHelpers/MonthOptions"
import { Field, Option } from "@/components/Forms/FieldInterface"
import HisDate from "@/utils/Date"
import StandardValidations from "@/components/Forms/validations/StandardValidations"
import { NUMBER_PAD_LO } from "@/components/Keyboard/KbLayouts"
import { NUMBERS_WITHOUT_NA_UNKNOWN } from '../../components/Keyboard/HisKbConfigurations';

export enum EstimationFieldType {
    AGE_ESTIMATE_FIELD = "age-estimate-field",
    MONTH_ESTIMATE_FIELD = "month-period-estimate-field"
}

export interface EstimationInterface {
    estimationFieldType?: EstimationFieldType;
    allowUnknown: boolean; 
    allowUnknownMonthDay?: boolean;
}

export interface DateFieldInterface {
    id: string;
    helpText: string;
    summaryLabel?: string;
    condition?: Function;
    required?: boolean;
    defaultValue?: Function;
    beforeNext?: Function;
    minDate?(formData: any, computeForm: any): string;
    maxDate?(formData: any, computeForm: any): string;
    unload?(data: any, state: string, formData: any,  computeForm: any): void; 
    computeValue: Function;
    appearInSummary?: Function;
    estimation: EstimationInterface;
    config?: any;
}

export function getYearField(id: string, name: string, showUnknown=true): Field {
    const primaryFunctions = []
    if (showUnknown) primaryFunctions.push('UNKNOWN')
    return {
        id,
        helpText: `${name} Year`,
        appearInSummary: () => false,
        type: FieldType.TT_TEXT,
        config: {
            customKeyboard: [
                NUMBER_PAD_LO,
                [
                    primaryFunctions,
                    ['DELETE']
                ]
            ]
        }
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
        type: FieldType.TT_MONTHLY_DAYS,
        appearInSummary: () => false
    }
}

export function getMonthDurationEstimateField(id: string, name: string): Field {
    return {
        id,
        helpText: `${name} Estimated period`,
        type: FieldType.TT_SELECT,
        appearInSummary: () => false,
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
        type: FieldType.TT_NUMBER,
        appearInSummary: () => false,
        config: {
            keypad: NUMBERS_WITHOUT_NA_UNKNOWN
        }
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

function d(date: string) {
    return HisDate.toStandardHisDisplayFormat(date)
}

function validateMinMax(date: string, field: DateFieldInterface, form: any, computed: any) {
    if (field.minDate) {
        const min = field.minDate(form, computed)
        if (new Date(date) < new Date(min)) {
            return [`${d(date)} is less than minimum date of ${d(min)}`]
        }
    }
    if (field.maxDate) {
        const max = field.maxDate(form, computed)
        if (new Date(date) > new Date(max)) {
            return [`${d(date)} is greater than max date of  ${d(max)}`]
        }
    }
}
/**
 * This Jungle of code generates Fields of Year, Month and Day.
 * 
 * if you're brave please refactor this. Just dont break anything Ok!
 * @param field 
 * @param refDate 
 * @returns 
 */
export function generateDateFields(field: DateFieldInterface, refDate=''): Array<Field> {
    let fullDate = ''
    let yearValue = ''
    let monthValue = ''
    let dayValue = ''

    const yearID = `year_${field.id}`
    const monthID = `month_${field.id}`
    const dayID = `day_${field.id}`
    const ageEstimateID = `age_estimate_${field.id}`
    const durationEstimateID = `duration_estimate_${field.id}`

    const year = getYearField(yearID, field.helpText, field.estimation.allowUnknown)
    const month = getMonthField(monthID, field.helpText)
    const day = getDayField(dayID, field.helpText)

    const ageEstimate = getAgeEstimateField(ageEstimateID, field.helpText)
    const durationEstimate = getMonthDurationEstimateField(durationEstimateID, field.helpText)

    const estimateMonthOrDay = typeof field.estimation.allowUnknownMonthDay === 'boolean'
        && field.estimation.allowUnknownMonthDay

    const datePartCondition = (f: any) => {
        if (f[yearID] && f[yearID].value) {
            if (['Unknown'].includes(f[yearID].value)) {
                return false
            }
        }
        return field.condition ? field.condition(f) : true
    }

    year.proxyID = field.id

    year.unload = (v: Option) => yearValue = v.value.toString()
 
    // YEAR CONFIG
    year.config = { ...year.config, ...field.config }

    year.defaultValue = () => getDefaultDate(field, 'Year')

    year.condition = (f: any) => field.condition 
        ? field.condition(f) 
        : true

    year.validation = (v: Option, f: any, c: any) => {
        if (field.required && StandardValidations.required(v)) {
            return ['Year cannot be empty']
        }
        const year = v ? v.value : ''
        if (!field.estimation.allowUnknown 
            && year.toString().match(/unknown/i)) {
            return ['Value unknown is not permitted']
        }
    
        if (year && !['Unknown'].includes(year as string)
            && isNaN(year as number)
            || year < 1900) {
            return ['Invalid Year']
        }

        if (year && typeof field.minDate === 'function') {
            const minYear = HisDate.getYear(field.minDate(f, c)) 
            if (parseInt(year as any) < minYear) {
                return [`Year of ${year} is less than Minimum year of ${minYear}`]
            }
        }

        if (year && typeof field.maxDate === 'function') {
            const maxYear = HisDate.getYear(field.maxDate(f, c))
            if (year > maxYear) {
                return [`Year of ${year} exceeds Maximum year of ${maxYear}`]
            }
        }

        return null
    }
    /**
     * Year Proxy field will be our reference point of 
     * how data should appear on the summary
     * @returns 
     */
    year.summaryMapValue = () => ({
        label: field.summaryLabel || field.helpText, 
        value: fullDate ? d(fullDate) : 'Unknown'
    })

    // To avoid the year from appearing on the summary, 
    // match the ref against the proxyID itself
    year.appearInSummary = (_: any, ref: string) => ref === field.id

    /**
     * This helps to keep computeValue of the dateProxy up-to-date when year changes
     * @param val 
     * @returns 
     */
    year.computedValue = (val: Option) => {
        if (fullDate) {
            const [_, month, day] = fullDate.split('-')
            fullDate = `${val.value}-${month}-${day}`
            return field.computeValue(fullDate, false)
        }
        if (val && val.value === 'Unknown') {
            fullDate = ''
            return field.computeValue('Unknown', false)
        }
    }

    // MONTH CONFIG
    month.proxyID = field.id

    month.unload = (v: Option) => monthValue = appendLeadingZero(v.value.toString())

    month.condition = (f: any) =>  datePartCondition(f)

    month.validation = (v: Option) => StandardValidations.required(v)

    month.defaultValue = () => getDefaultDate(field, 'Month')

    // Add Unknown value to trigger default estimated Month
    if (estimateMonthOrDay) {
        month.options = () => [...MonthOptions, { label: 'Unknown', value: 'Unknown'}]
    }

    /**
     *
     * This helps to keep compute value up to date when month changes
     * @param val
     * @returns
     */
    month.computedValue = (val: Option, f: any) => {
        // Estimate Month and Day when Month Value is Unknown
        if (`${val.value}`.match(/unknown/i)) {
            fullDate = `${f[yearID].value}-07-15`
            return field.computeValue(fullDate, true)
        }
        // Default date behaviour
        if (fullDate) {
            const [year, _, day] = fullDate.split('-')
            const month = appendLeadingZero(`${val.value}`)
            fullDate = `${year}-${month}-${day}`
            return field.computeValue(fullDate, false)
        }
    }

    day.proxyID = field.id

    // DAY CONFIG
    day.condition = (f: any) => !`${f[monthID].value}`.match(/unknown/i) && datePartCondition(f) 

    day.validation =  (v: Option, f: any, c: any) => {
        if (StandardValidations.required(v)) {
            return ['Day is required for date']
        }
        return validateMinMax(fullDate, field, f, c)
    }

    day.defaultValue = () => getDefaultDate(field, 'Day')

    day.computedValue = (v: Option) => {
        const isEstimate = `${v.value}`.match(/unknown/i) ? true : false
        // Use 15 as default value if day is estimated
        dayValue = isEstimate ? '15' :  appendLeadingZero(`${v.value}`)
        fullDate = `${yearValue}-${monthValue}-${dayValue}`
        return field.computeValue(fullDate, isEstimate)
    }

    day.unload = (d: any, s: any, f: any, c: any) => {
        if (field.unload) field.unload(d, s, f, c)
    }

    day.beforeNext = (v: any, f: any) => {
        return !field.beforeNext 
            ? true 
            : field.beforeNext(fullDate, f)
    }

    day.config = { 
        // Monthly days shown on the Day component depends on this configuration
        // to show approprite days based on specific year and month calendar
        year: (f: any) => f[yearID].value,
        month: (f: any) => f[monthID].value
    }
    // If not configured to do estimates, dont show Unknown Button which appears by default
    // on MonthlyDay component.
    if (!estimateMonthOrDay) day.config.keyboardActions = []

    const validateValueEstimate = (v: Option, f: any, c: any) => {
        if (StandardValidations.required(v)) {
            return ['Please select an estimate']
        }
        if (isNaN(parseInt(v.value.toString()))) {
            return ['Please enter a valid number']
        }
        return validateMinMax(fullDate, field, f, c)
    }

    const valueEstimateCondition = (f: any, estimateType: EstimationFieldType) => {
        const conditions = [
            f[yearID].value === 'Unknown',
            field.condition ? field.condition(f) : true,
            field.estimation.estimationFieldType === estimateType
        ]
        return conditions.every(Boolean)
    }

    // AGE ESTIMATE CONFIG
    ageEstimate.proxyID = field.id

    ageEstimate.validation = (v: Option, f: any, c: any) => {
        if (v && v.value > 300) {
            return ['Age estimate is too high and exceeding hard limit of 300']
        }
        return validateValueEstimate(v, f, c)
    }

    ageEstimate.condition = (form: any) => valueEstimateCondition(
        form, EstimationFieldType.AGE_ESTIMATE_FIELD
    ) 

    ageEstimate.computedValue = (val: Option) => {
        const [year] = HisDate.estimateDateFromAge(
            parseInt(val.value.toString())
            )
            .split('-')
        fullDate = `${year}-07-15`
        return field.computeValue(fullDate, true)
    }

    ageEstimate.beforeNext = (v: any, f: any) => {
        return !field.beforeNext 
            ? true 
            : field.beforeNext(fullDate, f)
    }

    // DURATION ESTIMATE
    durationEstimate.proxyID = field.id

    durationEstimate.validation = validateValueEstimate

    durationEstimate.condition = (form: any) => valueEstimateCondition(
        form, EstimationFieldType.MONTH_ESTIMATE_FIELD
    ) 

    durationEstimate.computedValue = (val: Option) => {
        const [year] = HisDate.getDateBeforeByDays(
            refDate, parseInt(val.value.toString()
            )).split('-')
        fullDate = `${year}-07-15`
        return field.computeValue(fullDate, true)
    }

    durationEstimate.beforeNext = (_: any, f: any) => {
        return !field.beforeNext 
            ? true 
            : field.beforeNext(fullDate, f)
    }

    return [
        year,
        month,
        day,
        ageEstimate,
        durationEstimate
    ]
}
