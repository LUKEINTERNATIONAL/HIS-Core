import BaseReport from '@/views/reports/BaseReport.vue'
import Triage from '@/apps/Triage/Components/HomeOverview.vue';

import Scanner from '@/apps/Triage/Components/Scanner.vue';
import ScreenPatient from "@/apps/Triage/views/encounters/ScreenPatient.vue";

// import LinkConfiguration from '@/apps/Triage/Components/LinkConfiguration.vue'
import Administration from '@/views/Administration.vue'
import TriageReport from '@/apps/Triage/views/reports/Reports.vue'
import TriageRegistrationReport from '@/apps/Triage/views/reports/TriageRegistrationReport.vue'
import TriageCovid19Report from '@/apps/Triage/views/reports/TriageCovid19Report.vue'
import Settings from '@/apps/Triage/views/Settings.vue'
import Vitals from "@/apps/Triage/views/encounters/Vitals.vue"
import TriagePatientRegistration from '@/apps/Triage/views/encounters/PatientRegistration.vue'
import TriageSearchPatient from "@/apps/Triage/views/encounters/SearchPatient.vue";
import bluetoothPrinter from "@/apps/Triage/Components/bluetoothPrinter.vue";

export default [
  {
    path: '/triage',
    name: 'Triage',
    component: Triage
  },
  {
    path: '/bluetoothPrinter/:patient_id',
    name: 'Bluetooth Printer',
    component: bluetoothPrinter
  },
  {
    path: '/triage_search_patient/:firstname/:surname/:gender/:birthday/:malawiNationalID',
    name: 'Triage Search Patient',
    component: TriageSearchPatient
  },
  {
    path: '/screening/:patient_id/:encounterID',
    name: 'Screen Patient',
    component: ScreenPatient,
  },

  {
    path: '/scanner',
    name: 'Scanner',
    component: Scanner,
  },
  {
    path: '/triage_search_client',
    name: 'Triage Search client',
    component: TriageSearchPatient
  },
  {
    path: '/triage_patient/registration/:firstname/:surname/:gender/:birthday/:malawiNationalID',
    name: 'Triage Patient Registration',
    component: TriagePatientRegistration,
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  },
  {
    path: '/triageReport',
    name: 'Triage Report',
    component: TriageReport
  },
  {
    name: "triage_vitals",
    path: "/triage/encounters/vitals/:patient_id/:triageAlerts",
    component: Vitals
  },
  {
    path: '/triage/reports/MOH',
    component: BaseReport,
    children: [
      {
        name: 'triage_registration_report',
        path: "triage_registration_report",
        component: TriageRegistrationReport
      },
      {
        name: 'triage_convid19_report',
        path: "triage_convid19_report",
        component: TriageCovid19Report
      }
    ]
  },
]

