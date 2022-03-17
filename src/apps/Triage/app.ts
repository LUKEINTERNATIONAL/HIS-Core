import { AppInterface } from "../interfaces/AppInterface";
import appRoutes from '@/apps/Triage/config/routes'
import homeOverviewComponent from "@/apps/Triage/Components/HomeOverview.vue"
import { PRIMARY_ACTIVITIES,  } from '@/apps/Triage/config/programActivities';
import { REPORTS } from '@/apps/Triage/config/programReports';

const Triage: AppInterface = {
    programID: 14,
    applicationName: 'Triage',
    applicationIcon: 'tb.png',
    applicationDescription: "Outpatient Program",
    appRoutes,
    programReports: REPORTS,
    primaryPatientActivites: PRIMARY_ACTIVITIES,
    secondaryPatientActivites: [],
    globalPropertySettings: [],
    homeOverviewComponent,
   
   
}
export default Triage
