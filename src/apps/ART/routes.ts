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
        name: 'disaggregated',
        path: "/art/reports/pepfar/disaggregated",
        component: PepFarDiaggregatedReport
    },
    {
        name: 'defaulters',
        path: "/art/reports/pepfar/defaulters",
        component: PepFarDefaultersReport
    },
    {
        name: 'regimen',
        path: "/art/reports/pepfar/regimen",
        component: PepFarRegimenReport
    },
    {
        name: 'regimen switch',
        path: "/art/reports/pepfar/regimen/switch",
        component: PepFarRegimenSwitchReport
    },
    {
        name: 'tb prev',
        path: "/art/reports/pepfar/tb/prev",
        component: TBPrevReport
    },
    {
        name: 'tx curr mmd',
        path: "/art/reports/pepfar/tx/curr",
        component: TXCurrMMD
    },
    {
        name: 'tx ml',
        path: "/art/reports/pepfar/tx/ml",
        component: TXCurrMl
    },
    {
        name: 'tx rtt',
        path: "/art/reports/pepfar/tx/rtt",
        component: TXRtt
    }
]
