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
import BPManagment from "@/apps/ART/views/encounters/BPManagement.vue"
import LabActivities from "@/apps/ART/views/encounters/LabActivities.vue"
import Mastercard from "@/apps/ART/views/Mastercard.vue"
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
import ClinicViralLoadReport from "@/apps/ART/views/reports/clinic/ClinicViralLoadReport.vue"
import ClinicOtherOutcomeReport from "@/apps/ART/views/reports/clinic/ClinicOtherOutcomeReport.vue"
import ClinicRegimenFormulationReport from "@/apps/ART/views/reports/clinic/ClinicRegimenFormulationReport.vue"
import ClinicLabResultsReport from "@/apps/ART/views/reports/clinic/ClinicLabResultsReport.vue"
import MohDisaggregatedReport from "@/apps/ART/views/reports/moh/MohDisaggregatedReport.vue"
import MohSurvivalAnalysisReport from "@/apps/ART/views/reports/moh/MohSurvivalAnalysisReport.vue"
import MohTptInitiationsReport from "@/apps/ART/views/reports/moh/MohTptInitiationsReport.vue"
import MohTxCurrMMD from "@/apps/ART/views/reports/moh/MohTxCurrMMD.vue"
import MohCohort from "@/apps/ART/views/reports/moh/CohortReport/MohCohort.vue"
import ReportTemplate from "@/apps/ART/views/reports/pepfar/PepfarIndex.vue"
import StockCardReport from "@/apps/ART/views/reports/clinic/ClinicStockCardReport.vue"
import ClinicAppointments from "@/apps/ART/views/reports/clinic/ClinicAppointments.vue"
import DataCleaning from "@/apps/ART/views/reports/inconsistencies/DataCleaning.vue"
import HyperTensionDiagnosis from "@/apps/ART/views/encounters/hypertension_diagnosis.vue"
import BPPrescription from "@/apps/ART/views/encounters/BPDrug_management.vue"
import SocialHistory from "@/apps/ART/views/encounters/SocialHistory.vue"
import BPAdherence from "@/apps/ART/views/encounters/BPAdherence.vue"

export default [
    {
        name: "filing management",
        path: '/art/filing_numbers/:patient_id',
        component: () => import("@/apps/ART/views/FilingNumberManagement.vue")
    },
    {
        name: "Set Clinic Days",
        path: "/art/preferences/clinic_days",
        component: () => import("@/apps/ART/views/preferences/SetClinicDays.vue")
    },
    {
        name: "Set HTN Age",
        path: "/art/preferences/htn_age",
        component: () => import("@/apps/ART/views/preferences/SetHTNAge.vue")
    },
    {
        name: "Set filing number limit",
        path: "/art/preferences/fn/limit",
        component: () => import("@/apps/ART/views/preferences/SetFilingNumbersLimit.vue")
    },
    {
        name: "Set Appointment limit",
        path: "/art/preferences/appointment/limit",
        component: () => import("@/apps/ART/views/preferences/SetAppointmentLimit.vue")
    },
    {
        name: "Enter stock",
        path: "/art/stock/enter",
        component: () => import("@/apps/ART/views/ARTStock/enter_receipts.vue")
    },
    {
        name: "Audit trail",
        path: "/art/stock/trail",
        component: () => import("@/apps/ART/views/ARTStock/AuditTrail.vue")
    },
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
        name: "BP management",
        path: "/art/encounters/bp_management/:patient_id",
        component: BPManagment
    },
    {
        name: "Hypertesnion diagnosis",
        path: "/art/encounters/hypertension_diagnosis/:patient_id",
        component: HyperTensionDiagnosis
    },
    {
        name: "BP prescription",
        path: "/art/encounters/bp_prescription/:patient_id",
        component: BPPrescription
    },
    {
        name: "Social history",
        path: "/art/encounters/social_history/:patient_id",
        component: SocialHistory
    },
    {
        name: "BP adherence",
        path: "/art/encounters/bp_adherence/:patient_id",
        component: BPAdherence
    },
    {
        name: "lab activities",
        path: "/art/encounters/lab/:patient_id",
        component: LabActivities
    },
    {
        name: "patient mstercard",
        path: "/art/mastercard/:patient_id",
        component: Mastercard
    },
    {
        name: "Data cleaning",
        path: "/data_cleaning",
        component: DataCleaning
    },
    {
        path: '/art/report/moh',
        component: ReportTemplate,
        children: [
            {
                name: 'moh_cohort',
                path: 'moh_cohort',
                component: MohCohort
            },
            {
                name: 'moh_disaggregated',
                path: 'moh_disaggregated',
                component: MohDisaggregatedReport
            }, 
            {
                name: 'moh_survial_analysis',
                path: 'moh_survial_analysis',
                component: MohSurvivalAnalysisReport
            }, 
            {
                name: 'moh_tpt_new_initiations',
                path: 'moh_tpt_new_initiations',
                component: MohTptInitiationsReport
            }, 
            {
                name: 'moh_tx_curr_mmd',
                path: 'moh_tx_curr_mmd',
                component: MohTxCurrMMD
            }
        ]
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
                name: "clinic_lab_results",
                path: "clinic_lab_results",
                component: ClinicLabResultsReport
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
            {
                name: "clinic_appointments",
                path: "clinic_appointments",
                component: ClinicAppointments
            },
            {
                name: "stock_card_report",
                path: "stock_card_report",
                component: StockCardReport
            },
            {
                name: "clinic_viral_load",
                path: "clinic_viral_load",
                component: ClinicViralLoadReport
            },
            {
                name: "clinic_other_outcome_list",
                path: "clinic_other_outcome_list",
                component: ClinicOtherOutcomeReport
            },
            {
                name: "clinic_regimen_formulation",
                path: "clinic_regimen_formulation",
                component: ClinicRegimenFormulationReport
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
