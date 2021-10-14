import { AppInterface } from "../interfaces/AppInterface";
import homeOverviewComponent from "@/apps/LOS/Components/losHomeOverviewComponent.vue";

const LOS: AppInterface = {
    programID: 23,
    applicationName: 'LOS',
    applicationIcon: 'order.png',
    applicationDescription: "Lab Order System",
    appRoutes: [],
    primaryPatientActivites: [],
    secondaryPatientActivites: [],
    globalPropertySettings: [],
    homeOverviewComponent,
    confirmationSummary: () => ({}),
}
export default LOS
