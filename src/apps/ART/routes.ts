import Prescription from "@/apps/ART/views/encounters/Prescription.vue"
import Registration from "@/apps/ART/views/encounters/Registration.vue"
import Appointments from "@/apps/ART/views/encounters/Appointment.vue"
import Adherence from "@/apps/ART/views/encounters/Adherence.vue"
import Consultation from "@/apps/ART/views/encounters/Consultation.vue"
import Dispensing from "@/apps/ART/views/encounters/Dispensing.vue"
import Reception from "@/apps/ART/views/encounters/Reception.vue"
import Staging from "@/apps/ART/views/encounters/Staging.vue"
import Vitals from "@/apps/ART/views/encounters/Vitals.vue"
import PatientType from "@/apps/ART/views/encounters/PatientType.vue"
import FastTrack from "@/apps/ART/views/encounters/FastTrack.vue"
import LabActivities from "@/apps/ART/views/encounters/LabActivities.vue"
import PepFarDiaggregatedReport from "@/apps/ART/views/reports/pepfar/disaggregated.vue"
import PepFarDefaultersReport from "@/apps/ART/views/reports/pepfar/defaulters.vue"
import PepFarRegimenReport from "@/apps/ART/views/reports/pepfar/regimen.vue"
import PepFarRegimenSwitchReport from "@/apps/ART/views/reports/pepfar/RegimenSwitch.vue"
import TBPrevReport from "@/apps/ART/views/reports/pepfar/TBPrev.vue"
import TXCurrMMD from "@/apps/ART/views/reports/pepfar/TxCurrMMD.vue"
import TXCurrMl from "@/apps/ART/views/reports/pepfar/TxCurrMl.vue"
import TXRtt from "@/apps/ART/views/reports/pepfar/TxRtt.vue"
import ClinicMissedAppointmentsReport from "@/apps/ART/views/reports/clinic/ClinicMissedAppointments.vue"
import ClinicDefaultersReport from "@/apps/ART/views/reports/clinic/ClinicDefaulters.vue"
import ClinicRegimenReport from "@/apps/ART/views/reports/clinic/ClinicRegimenReport.vue"
import ClinicRegimenSwitchReport from "@/apps/ART/views/reports/clinic/ClinicRegimenSwitchReport.vue"
import ClinicPregnantPatientsReport from "@/apps/ART/views/reports/clinic/ClinicPregnantPatientsReport.vue"
import ClinicClientsDueForViralLoad from "@/apps/ART/views/reports/clinic/ClinicDueForViralLoad.vue"
import ClinicRetentionReport from "@/apps/ART/views/reports/clinic/ClinicRetentionReport.vue"
import ClinicExternalConsultationReport from "@/apps/ART/views/reports/clinic/ClinicExternalConsultation.vue"
import ReportTemplate from "@/apps/ART/views/reports/pepfar/PepfarIndex.vue"
import ReportDatePicker from "@/apps/ART/views/reports/DateIntervalLauncher.vue"

export default [
    {
        name: "treatment",
        path: "/art/encounters/prescriptions/:patient_id",
        component: Prescription
    },
    {
        name: "art adherence",
        path: "/art/encounters/adherence/:patient_id",
        component: Adherence
    },
    {
        name: "hiv clinic consultation",
        path: "/art/encounters/consultation/:patient_id",
        component: Consultation
    },
    {
        name: "hiv clinic registration",
        path: "/art/encounters/registration/:patient_id",
        component: Registration
    },
    {
        name: "hiv reception",
        path: "/art/encounters/reception/:patient_id",
        component: Reception
    },
    {
        name: "hiv staging",
        path: "/art/encounters/staging/:patient_id",
        component: Staging
    },
    {
        name: "appointment",
        path: "/art/encounters/appointment/:patient_id",
        component: Appointments
    },
    {
        name: "dispensing",
        path: "/art/encounters/dispensation/:patient_id",
        component: Dispensing
    },
    {
        name: "vitals",
        path: "/art/encounters/vitals/:patient_id",
        component: Vitals
    },
    {
        name: "htn_vitals",
        path: "/art/encounters/vitals/:patient_id",
        component: Vitals
    },
    {
        name: "patient type",
        path: "/art/encounters/patient_type/:patient_id",
        component: PatientType
    },
    {
        name: "fast track assesment",
        path: "/art/encounters/fast_track/:patient_id",
        component: FastTrack
    },
    {
        name: "lab activities",
        path: "/art/encounters/lab/:patient_id",
        component: LabActivities
    },
    {
        name: 'Report date launcher',
        path: '/art/report/launcher/dateinterval',
        component: ReportDatePicker
    },
    {
        path: '/art/report/clinic',
        component: ReportTemplate,
        children: [
            {
                name: 'clinic_retention_report',
                path: "clinic_retention_report",
                component: ClinicRetentionReport
            },
            {
                name: 'clinic_external_consultation_report',
                path: "clinic_external_consultation_report",
                component: ClinicExternalConsultationReport
            },
            {
                name: 'clinic_due_viral_load_report',
                path: "clinic_due_viral_load_report",
                component: ClinicClientsDueForViralLoad
            },
            {
                name: 'clinic_missed_appointments',
                path: "clinic_missed_appointments",
                component: ClinicMissedAppointmentsReport
            },
            {
                name: "clinic_defaulters_report",
                path: "clinic_defaulters",
                component: ClinicDefaultersReport
            },
            {
                name: "clinic_regimen_report",
                path: "clinic_regimen_report",
                component: ClinicRegimenReport
            },
            {
                name: "clinic_regimen_switch",
                path: "clinic_regimen_switch",
                component: ClinicRegimenSwitchReport
            },
            {
                name: "clinic_pregnant_patients",
                path: "clinic_pregnant_patients",
                component: ClinicPregnantPatientsReport
            },
        ]
    },
    {
        path: '/art/report/pepfar',
        component: ReportTemplate,
        children: [
            {
                name: 'pepfar_disaggregated_report',
                path: "disaggregated",
                component: PepFarDiaggregatedReport
            },
            {
                name: "pepfar_defaulters_report",
                path: "defaulters",
                component: PepFarDefaultersReport
            },
            {
                name: "pepfar_regimen_report",
                path: "regimens",
                component: PepFarRegimenReport
            },
            {
                name: "pepfar_regimen_switch",
                path: "regimen_switch",
                component: PepFarRegimenSwitchReport
            },
            {
                name: "pepfar_tb_prev_report",
                path: "tb_prev",
                component: TBPrevReport
            },
            {
                name: "pepfar_tx_curr_mmd_report",
                path: "tx_cur_mmd",
                component: TXCurrMMD
            },
            {
                name: "pepfar_tx_ml_report",
                path: "tx_ml",
                component: TXCurrMl
            },
            {
                name: "pepfar_tx_rtt",
                path: "tx_rtt",
                component: TXRtt
            }
        ]
    }
]
