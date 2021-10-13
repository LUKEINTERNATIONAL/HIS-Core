import { AppInterface } from "../interfaces/AppInterface";
import appRoutes from "./Config/ArtRoutes"
import homeOverviewComponent from "@/apps/ART/Components/ArtOverviewComponent.vue"
import patientDashboardComponent from "@/apps/ART/Components/ArtPatientDashboardComponent.vue"
import { REPORTS } from "@/apps/ART/Config/ArtProgramReports"
import {PROPERTIES} from "@/apps/ART/Config/ArtGlobalPropertySettings"
import { PRIMARY_ACTIVITIES, SECONDARY_ACTIVITIES } from "@/apps/ART/Config/ArtProgramActivities"
import { init } from "@/apps/ART/Config/ArtAppScripts"
import { GlobalPropertyService } from "@/services/global_property_service"
import { confirmationSummary } from "@/apps/ART/Config/ArtAppScripts"

const ART: AppInterface = {
    patientDashboard: {},
    init,
    programID: 1,
    applicationName: 'ART',
    applicationIcon: 'aids.png',
    applicationDescription: "HIV Client management app",
    appRoutes,
    primaryPatientActivites: PRIMARY_ACTIVITIES,
    secondaryPatientActivites: SECONDARY_ACTIVITIES,
    globalPropertySettings: PROPERTIES,
    patientDashboardComponent,
    homeOverviewComponent,
    programReports: REPORTS,
    confirmationSummary,
    programPatientIdentifiers: {
        'ARV Number': {
            id: 4,
            name: 'ARV Number',
            isPrimary: true,
            useForSearch: true,
            prefix: async () => {
                const prefix = await GlobalPropertyService.getSitePrefix()
                return `${prefix}-ARV-`
            }
        },
        'Archived filing number': {
            id: 18,
            name: 'Archived filing number',
            isPrimary: false,
            useForSearch: false,
            prefix: () => '',
            globalPropertySetting: 'use.filing.number=true',
        },
        'Filing number': {
            id: 17,
            name: 'Filing number',
            isPrimary: false,
            useForSearch: false,
            prefix: () => '',
            globalPropertySetting: 'use.filing.number=true',
        }
    },
}
export default ART
