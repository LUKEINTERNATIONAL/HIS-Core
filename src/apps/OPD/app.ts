import { AppInterface } from '@/apps/interfaces/AppInterface';
import HomeOverview from "@/apps/OPD/components/HomeOverview.vue";
import { PRIMARY_ACTIVITIES } from '@/apps/OPD/config/programActivities';

const OPD: AppInterface = {
  programID: 14,
  applicationName: 'OPD',
  applicationIcon: 'opd.png',
  applicationDescription: 'Outpatient Program',
  appRoutes: [],
  primaryPatientActivites: PRIMARY_ACTIVITIES,
  secondaryPatientActivites: [],
  homeOverviewComponent: HomeOverview
}

export default OPD