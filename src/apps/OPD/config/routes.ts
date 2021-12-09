export default [
  {
    name: "patient registration",
    path: "/opd/encounters/registration/:patient_id",
    component: () => import('@/apps/OPD/views/encounters/Registration.vue')
  },
  {
    name: "vitals",
    path: "/opd/encounters/vitals/:patient_id",
    component: () => import('@/apps/OPD/views/encounters/Vitals.vue')
  },
  {
    name: "outpatient diagnosis",
    path: "/opd/encounters/diagnosis/:patient_id",
    component: () => import('@/apps/OPD/views/encounters/Diagnosis.vue')
  },
  {
    name: "outcome status",
    path: "/opd/encounters/outcome-status/:patient_id",
    component: () => import('@/apps/OPD/views/encounters/OutcomeStatus.vue')
  },
  {
    name: "social history",
    path: "/opd/encounters/social/:patient_id",
    component: () => import('@/apps/OPD/views/encounters/SocialHistory.vue')
  },
  {
    name: "presenting complaints",
    path: "/opd/encounters/complaints/:patient_id",
    component: () => import('@/apps/OPD/views/encounters/Complaints.vue')
  },
  {
    name: "prescription",
    path: "/opd/encounters/prescription/:patient_id",
    component: () => import('@/apps/OPD/views/encounters/Prescription.vue')
  },
]
