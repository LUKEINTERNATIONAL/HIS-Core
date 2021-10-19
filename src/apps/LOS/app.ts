import { AppInterface } from "../interfaces/AppInterface";
import homeOverviewComponent from "@/apps/LOS/Components/losHomeOverviewComponent.vue";
import customPatientDashboardContentComponent from "@/apps/LOS/Components/losCustomDashboardContent.vue"
import {PRIMARY_ACTIVITIES} from "@/apps/LOS/config/LosProgramActivities"
import Routes from "@/apps/LOS/config/LosRoutes"
import { OrderService } from "@/services/order_service";
import HisDate from "@/utils/Date"

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
        'LAB ORDERS': async () => {
            const orders = await OrderService.getOrders(patient.getID())
            return orders.map((t: any) => ({
                label: t.specimen.name,
                value: `${t.accession_number} - ${HisDate.toStandardHisDisplayFormat(t.order_date)}`
            }))
        }
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
