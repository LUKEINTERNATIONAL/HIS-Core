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
    confirmationSummary: (patient: any) => ({
        'PATIENT IDENTIFIERS': () => {
            return [
                {
                  label: "NPID",
                  value: patient.getNationalID(),
                }
            ]
        },
    }),
    programReports: [
        {
            name: 'Clinical',
            icon: 'reports.png',
            files: [
                {
                    name: 'Test requested',
                    pathUrl: '/los/report/tests/requests'
                },
                {
                    name: 'Test results',
                    pathUrl: '/los/report/tests/results'
                }
            ]
        }
    ]
}
export default LOS
