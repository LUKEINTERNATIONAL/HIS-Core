import { AppInterface } from "../interfaces/AppInterface";
import homeOverviewComponent from "@/apps/CxCa/Components/CxCaHomeOverviewComponent.vue";
import {PRIMARY_ACTIVITIES} from "@/apps/CxCa/config/CxCaProgramActivities"
import Routes from "@/apps/CxCa/config/CxCaRoutes"
import HisDate from "@/utils/Date"
import { WorkflowService } from "@/services/workflow_service";
import { ObservationService } from "@/services/observation_service";
import { 
    onRegisterPatient,
} from "@/apps/CxCa/config/CxCaAppScripts"
const CXCA: AppInterface = {
    programID: 24,
    applicationName: 'CxCa',
    applicationIcon: 'ccm.png',
    applicationDescription: "Cervical cancer screening module",
    appRoutes: Routes,
    primaryPatientActivites: PRIMARY_ACTIVITIES,
    secondaryPatientActivites: [],
    globalPropertySettings: [],
    onRegisterPatient,
    homeOverviewComponent,
    confirmationSummary: (patient: any, program: any) => ({
        'PATIENT IDENTIFIERS': () => {
            return [
                {
                  label: "NPID",
                  value: patient.getNationalID(),
                }
            ]
        },
        'OUTCOME': () => {
            return [
                { 
                    label: 'Current Outcome', 
                    value: program.outcome || 'N/A'
                }
            ]
        },
        'PROGRAM INFORMATION': async () => {
            const patientID = patient.getID()
            const data: any = []
            const params = await WorkflowService.getNextTaskParams(patientID)
            data.push({
              label: "Next Task",
              value: params.name ? `${params.name}` : 'NONE',
            })
            const appointMentObs: any[] = await ObservationService.getAll(patientID, 'appointment date');
            const nextAPPT = appointMentObs ? HisDate.toStandardHisDisplayFormat(appointMentObs[0].value_datetime) : 'Not Available'
            data.push({
                label: "Next Appointment",
                value: nextAPPT,
            });
            return data
        },
    }),
    programReports: [
        {
            name: 'Clinical',
            icon: 'reports.png',
            defaultFilesIcon: 'reports.png',
            files: [
               //placeholder for reports to be integrated 
                
            ]
        }
    ]
}
export default CXCA
