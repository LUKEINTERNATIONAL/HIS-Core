import { AppInterface } from '@/apps/interfaces/AppInterface';
import HomeOverview from "@/apps/OPD/components/HomeOverview.vue";

const OPD: AppInterface = {
  programID: 14,
  applicationName: 'OPD',
  applicationIcon: 'opd.png',
  applicationDescription: 'Outpatient Program',
  appRoutes: [],
  primaryPatientActivites: [],
  secondaryPatientActivites: [],
  homeOverviewComponent: HomeOverview
}

export default OPD