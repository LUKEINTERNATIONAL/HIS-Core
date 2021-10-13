import { AppInterface } from "../interfaces/AppInterface";
import appRoutes from "./Config/ArtRoutes"
import homeOverviewComponent from "@/apps/ART/Components/ArtOverviewComponent.vue"
import patientDashboardComponent from "@/apps/ART/Components/ArtPatientDashboardComponent.vue"
import { REPORTS } from "@/apps/ART/Config/ArtProgramReports"
import globalPropertySettings from "@/apps/ART/Config/ArtGlobalPropertySettings"
import { PRIMARY_ACTIVITIES, SECONDARY_ACTIVITIES } from "@/apps/ART/Config/ArtProgramActivities"

const ART: AppInterface = {
    programID: 1,
    applicationName: 'ART',
    applicationIcon: 'aids.png',
    applicationDescription: "HIV Client management app",
    appRoutes,
    primaryPatientActivites: PRIMARY_ACTIVITIES,
    secondaryPatientActivites: SECONDARY_ACTIVITIES,
    globalPropertySettings,
    patientDashboardComponent,
    homeOverviewComponent,
    programReports: REPORTS,
    programPatientIdentifiers: {
        'ARV Number': {
            id: 4,
            name: 'ARV Number',
            isPrimary: true,
            useForSearch: true,
            prefix: () => 'ARV'
        },
        'Archived filing number': {
            id: 18,
            name: 'Archived filing number',
            isPrimary: false,
            useForSearch: false,
            prefix: () => 'FN',
            globalPropertySetting: 'use.filing.number=true',
        },
        'Filing number': {
            id: 17,
            name: 'Filing number',
            isPrimary: false,
            useForSearch: false,
            prefix: () => 'FN',
            globalPropertySetting: 'use.filing.number=true',
        }
    },
    init: () => {
        //TODO: initialise activities here
    },
    patientSummary: (p: number) => {
        //TODO: format an object with patient program summary
        return {}
    }
}
export default ART
