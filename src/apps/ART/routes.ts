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
import Mastercard from "@/apps/ART/views/Mastercard.vue"

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
        name: "patient mstercard",
        path: "/art/mastercard/:patient_id",
        component: Mastercard
    }
]