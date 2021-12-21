import { AppInterface } from "../interfaces/AppInterface";
import appRoutes from "./Config/ArtRoutes"
import homeOverviewComponent from "@/apps/ART/Components/ArtOverviewComponent.vue"
import { REPORTS } from "@/apps/ART/Config/ArtProgramReports"
import {PROPERTIES} from "@/apps/ART/Config/ArtGlobalPropertySettings"
import { PRIMARY_ACTIVITIES, SECONDARY_ACTIVITIES } from "@/apps/ART/Config/ArtProgramActivities"
import { 
    init, 
    confirmationSummary,
    onRegisterPatient,
    formatPatientProgramSummary,
    getPatientDashboardAlerts
} from "@/apps/ART/Config/ArtAppScripts"
import { ART_GLOBAL_PROP } from "./art_global_props";
import GLOBAL_PROP from "@/apps/GLOBAL_APP/global_prop"

const ART: AppInterface = {
    init,
    programID: 1,
    applicationName: 'ART',
    applicationIcon: 'aids.png',
    applicationDescription: "HIV Client management app",
    appRoutes,
    primaryPatientActivites: PRIMARY_ACTIVITIES,
    secondaryPatientActivites: SECONDARY_ACTIVITIES,
    globalPropertySettings: PROPERTIES,
    programReports: REPORTS,
    homeOverviewComponent,
    confirmationSummary,
    formatPatientProgramSummary,
    getPatientDashboardAlerts,
    onRegisterPatient,
    programPatientIdentifiers: {
        'ARV Number': {
            id: 4,
            name: 'ARV Number',
            isPrimary: true,
            useForSearch: true,
            prefix: async () => `${(await GLOBAL_PROP.sitePrefix())}-ARV-`
        },
        'Archived filing number': {
            id: 18,
            name: 'Archived filing number',
            isPrimary: false,
            useForSearch: false,
            prefix: () => '',
            globalPropertySetting: `${ART_GLOBAL_PROP.FILING_NUMBERS}=true`,
        },
        'Filing number': {
            id: 17,
            name: 'Filing number',
            isPrimary: false,
            useForSearch: false,
            prefix: () => '',
            globalPropertySetting: `${ART_GLOBAL_PROP.FILING_NUMBERS}=true`,
        }
    },
}
export default ART
