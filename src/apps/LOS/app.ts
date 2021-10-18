import { AppInterface } from "../interfaces/AppInterface";
import homeOverviewComponent from "@/apps/LOS/Components/losHomeOverviewComponent.vue";
import customPatientDashboardContentComponent from "@/apps/LOS/Components/losCustomDashboardContent.vue"
import {PRIMARY_ACTIVITIES} from "@/apps/LOS/config/LosProgramActivities"
import Routes from "@/apps/LOS/config/LosRoutes"

const LOS: AppInterface = {
    programID: 23,
    applicationName: 'LOS',
    applicationIcon: 'order.png',
    applicationDescription: "Lab Order System",
    appRoutes: Routes,
    primaryPatientActivites: PRIMARY_ACTIVITIES,
    secondaryPatientActivites: [],
    globalPropertySettings: [],
    homeOverviewComponent,
    customPatientDashboardContentComponent,
    confirmationSummary: () => ({}),
}
export default LOS
