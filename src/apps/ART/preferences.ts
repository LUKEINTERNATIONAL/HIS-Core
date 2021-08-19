import SiteCode from "@/components/SetSiteCode.vue"
import ClinicDays from "@/components/SetClinicDays.vue"
import HtnAge from "@/components/SetHTNAge.vue"
import AppointmentLimit from "@/components/SetAppointmentLimit.vue"
import FilingNumbers from "@/components/SetFilingNumbersLimit.vue"
import SiteLocation from "@/components/SetSiteLocation.vue"
import SessionDate from "@/views/SessionDate.vue"
// Reference names for BaseFormComponents
export enum FieldType {
    TT_SET_SITE_CODE="site-code",
    TT_SET_CLINC_DAY="clinic-days",
    TT_SET_HTN_AGE="htn-age",
    TT_SET_APPOINTMENT_LIMIT="appointment-limit",
    TT_SET_FILING_NUMBERS_LIMIT="filing-numbers" ,
    TT_SET_SITE_LOCATION="site-location",
    TT_SESSION_DATE='session-date'
}
// Components to be rendered
export const BasePrefernceComponents = {
    SiteCode: SiteCode,
    ClinicDays: ClinicDays,
    HtnAge: HtnAge,
    AppointmentLimit: AppointmentLimit,
    FilingNumbers: FilingNumbers,
    SiteLocation: SiteLocation,
    SessionDate
}