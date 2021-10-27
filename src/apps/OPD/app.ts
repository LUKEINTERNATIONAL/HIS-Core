import { AppInterface } from '@/apps/interfaces/AppInterface';
import HomeOverview from "@/apps/OPD/components/HomeOverview.vue";
import { PRIMARY_ACTIVITIES } from '@/apps/OPD/config/programActivities';
import { REPORTS } from '@/apps/OPD/config/programReports';
import OpdRoutes from '@/apps/OPD/config/routes';

const OPD: AppInterface = {
  programID: 14,
  applicationName: 'OPD',
  applicationIcon: 'opd.png',
  applicationDescription: 'Outpatient Program',
  appRoutes: OpdRoutes,
  programReports: REPORTS,
  primaryPatientActivites: PRIMARY_ACTIVITIES,
  secondaryPatientActivites: [],
  homeOverviewComponent: HomeOverview
}

export default OPD