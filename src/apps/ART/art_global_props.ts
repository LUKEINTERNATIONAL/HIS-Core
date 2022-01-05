import { GlobalPropertyService } from "@/services/global_property_service"

export enum ART_GLOBAL_PROP {
    EXTENDED_LABS = 'extended_labs',
    VL_ROUTINE_CHECK = 'activate_vl_routine_check',
    PILLS_REMAINING = 'ask_pills_remaining_at_home',
    FILING_NUMBERS = 'use.filing.numbers',
    DRUG_MANAGEMENT = 'activate.drug.management',
    HTN_ENHANCEMENT = 'activate.htn.enhancement',
    FAST_TRACK = 'enable_fast_track',
    THREE_HP_AUTO_SELECT = 'activate_3hp_auto_select',
    APPOINTMENT_LIMIT = 'clinic.appointment.limit',
    HTN_SCREENING_AGE_THRESHOLD = 'htn.screening.age.threshold',
    PEADS_CLINIC_DAYS = 'peads.clinic.days',
    ADULT_CLINIC_DAYS = 'clinic.days',
    FILING_NUMBER_LIMIT = 'filing.number.limit',
    FILING_NUMBER_PREFIX = 'filing.number.prefix'
}

function threeHPAutoSelectEnabled() {
    return GlobalPropertyService.isProp(`${ART_GLOBAL_PROP.THREE_HP_AUTO_SELECT}=true`)
}

function extendedLabEnabled() {
    return GlobalPropertyService.isProp(`${ART_GLOBAL_PROP.EXTENDED_LABS}=true`)
}

function filingNumbersEnabled() {
    return GlobalPropertyService.isProp(`${ART_GLOBAL_PROP.FILING_NUMBERS}=true`)
}

function drugManagementEnabled() {
    return GlobalPropertyService.isProp(`${ART_GLOBAL_PROP.DRUG_MANAGEMENT}=true`)
}

function htnEnabled() {
    return GlobalPropertyService.isProp(`${ART_GLOBAL_PROP.HTN_ENHANCEMENT}=true`)
}

function askPillsRemaining() {
    return GlobalPropertyService.isProp(`${ART_GLOBAL_PROP.PILLS_REMAINING}=true`)
}

function appointmentLimit() {
    return GlobalPropertyService.get(ART_GLOBAL_PROP.APPOINTMENT_LIMIT)
}

function htnAgeThreshold() {
    return GlobalPropertyService.get(ART_GLOBAL_PROP.HTN_SCREENING_AGE_THRESHOLD)
}

function filingNumberLimit() {
    return GlobalPropertyService.get(ART_GLOBAL_PROP.FILING_NUMBER_LIMIT)
}

function filingNumberPrefix() {
    return GlobalPropertyService.get(ART_GLOBAL_PROP.FILING_NUMBER_PREFIX)
}

function adultClinicDays() {
    return GlobalPropertyService.get(ART_GLOBAL_PROP.ADULT_CLINIC_DAYS)
}

function peadsClinicDays() {
    return GlobalPropertyService.get(ART_GLOBAL_PROP.PEADS_CLINIC_DAYS)
}

function setHtnAgeThreshold(threshold: string) {
    return GlobalPropertyService.set(ART_GLOBAL_PROP.HTN_SCREENING_AGE_THRESHOLD, threshold)
}

function setAppointmentLimit(limit: string) {
    return GlobalPropertyService.set(ART_GLOBAL_PROP.APPOINTMENT_LIMIT, limit)
}

function setAdultClinicDays(days: string) {
    return GlobalPropertyService.set(ART_GLOBAL_PROP.ADULT_CLINIC_DAYS, days)
}

function setPeadsClinicDays(days: string) {
    return GlobalPropertyService.set(ART_GLOBAL_PROP.PEADS_CLINIC_DAYS, days)
}

function setFilingNumberLimit(limit: string) {
    return GlobalPropertyService.set(ART_GLOBAL_PROP.FILING_NUMBER_LIMIT, limit)
}

export default {
    htnAgeThreshold,
    setHtnAgeThreshold,
    setFilingNumberLimit,
    setAppointmentLimit,
    filingNumberLimit,
    filingNumberPrefix,
    adultClinicDays,
    peadsClinicDays,
    setAdultClinicDays,
    setPeadsClinicDays,
    filingNumbersEnabled,
    drugManagementEnabled,
    htnEnabled,
    appointmentLimit,
    askPillsRemaining,
    extendedLabEnabled,
    threeHPAutoSelectEnabled
}