import BaseReport from '@/views/reports/BaseReport.vue'

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
    path: '/opd/reports/clinic',
    component: BaseReport,
    children: [
      {
        name: 'clinic_with_nids',
        path: "clinic_with_nids",
        component: () => import('@/apps/OPD/views/reports/clinic/ClinicWithNIDsReport.vue')
      },
      {
        name: 'clinic_drugs_given',
        path: "clinic_drugs_given",
        component: () => import('@/apps/OPD/views/reports/clinic/DrugsGiven.vue')
      },
      {
        name: 'clinic_drugs',
        path: "clinic_drugs",
        component: () => import('@/apps/OPD/views/reports/clinic/DrugsGivenWithPrescription.vue')
      },
      {
        name: 'clinic_registration',
        path: "cclinic_registration",
        component: () => import('@/apps/OPD/views/reports/clinic/ClinicRegistrationReport.vue')
      },
      {
        name: 'clinic_la',
        path: 'clinic_la',
        component: () => import('@/apps/OPD/views/reports/clinic/LaReport.vue')
      },
      {
        name: 'clinic_cases_seen',
        path: 'clinic_cases_seen',
        component: () => import('@/apps/OPD/views/reports/clinic/ClinicCasesSeen.vue')
      },
      {
        name: 'clinic_mental_health',
        path: 'clinic_mental_health',
        component: () => import('@/apps/OPD/views/reports/clinic/MentalHealth.vue')
      }
    ]
  },
]

