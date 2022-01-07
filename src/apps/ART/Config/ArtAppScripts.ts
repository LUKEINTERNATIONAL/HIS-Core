import { modalController } from "@ionic/vue";
import ActivitiesModal from "@/apps/ART/Components/ActivitiesSelection.vue";
import { PRIMARY_ACTIVITIES } from "./ArtProgramActivities";
import {TaskInterface} from "./../../interfaces/TaskInterface"
import { WorkflowService } from "@/services/workflow_service"
import PatientAlerts from "@/services/patient_alerts"
import { RelationshipService } from "@/services/relationship_service";
import { PatientProgramService } from "@/services/patient_program_service";
import { ProgramService } from "@/services/program_service";
import { OrderService } from "@/services/order_service";
import { Observation } from "@/interfaces/observation";
import { ObservationService } from "@/services/observation_service";
import { ConceptService } from "@/services/concept_service"
import HisDate from "@/utils/Date"
import { GeneralDataInterface } from "@/apps/interfaces/AppInterface";
import { PatientTypeService } from "@/apps/ART/services/patient_type_service"
import DrugModalVue from "@/apps/ART/Components/DrugModal.vue";
import ART_GLOBAL_PROP from "../art_global_props";

async function enrollInArtProgram(patientID: number, patientType: string, clinic: string) {
    const program = new PatientProgramService(patientID)
    const enroll = await program.enrollProgram()
    if (enroll) {
        //Create pre-art state
        program.setStateId(1) 
        await program.updateState()
    }

    const patientTypeService = new PatientTypeService(patientID, -1)

    patientTypeService.setPatientType(patientType)
    patientTypeService.setLocationName(clinic)

    await patientTypeService.createEncounter()
    await patientTypeService.save()
}

/**
 * Present a modal to select Art activities
 */
async function showArtActivities() {
    const activities = PRIMARY_ACTIVITIES
        .filter(a => (typeof a.availableOnActivitySelection === 'boolean' 
            && a.availableOnActivitySelection)
            || typeof a.availableOnActivitySelection != 'boolean'
        )
        .map((activity: TaskInterface)=> ({
            value: activity.workflowID 
                || activity.name,
            selected: false
        }))
    const modal = await modalController.create({
        component: ActivitiesModal,
        cssClass: "my-custom-class",
        backdropDismiss: false,
        componentProps: {
            activities
        }
    });
    modal.present();
    await modal.onDidDismiss()
}

/**
 * Present a modal to show drug chart
 */
async function showStockManagementChart() {
    if((await ART_GLOBAL_PROP.drugManagementEnabled())){
        const drugModal = await modalController.create({
            component: DrugModalVue,
            cssClass: "large-modal",
            backdropDismiss: false
        });
        drugModal.present() 
        await drugModal.onDidDismiss()
    }
}

export async function init(context='') {
    await showArtActivities()
    if (context === 'HomePage') {
        await showStockManagementChart()
    }
}

export async function onRegisterPatient(patientID: number, person: any, attr: any, router: any) {
    await enrollInArtProgram(patientID, person.patient_type, person.location)
    // Assign filing number if property use_filing_numbers is enabled
    if ((await ART_GLOBAL_PROP.filingNumbersEnabled())) {
        let nextRoute = `/art/filing_numbers/${patientID}?assign=true`
        if (person.relationship === 'Yes') {
            nextRoute += '&next_workflow_task=Guardian Registration'
        }
        router.push(nextRoute)
        return true
    }
}

export async function getPatientDashboardAlerts(patient: any): Promise<GeneralDataInterface[]>{
    const sideEffects: Observation[] 
    = await PatientAlerts.alertSideEffects(
        patient.getID()
    )
    return [
        {
            label: "Side effects",
            value: `${sideEffects.length}`,
        }
    ]
}

export function formatPatientProgramSummary(data: any) {
    return  [
        { label: "ART- Start Date", value: data.art_start_date},
        { label: "ARV Number", value: `${data.arv_number} | Regimen: ${data.current_regimen}` },
        { label: "File Number", value: data.filing_number.number},
        { label: "Current Outcome", value: data.current_outcome},
    ]
}

export function confirmationSummary(patient: any, program: any) {
    const patientID = patient.getID()
    return {
        'PROGRAM INFORMATION': async () => {
            const data: any = []
            const params = await WorkflowService.getNextTaskParams(patientID)
            data.push({
              label: "Next Task",
              value: params.name ? `${params.name}` : 'NONE',
            })
            await ProgramService.getProgramInformation(patientID)
              .then(
              (program) => {
                data.push({
                  label: "ART Duration",
                  value: `${program.art_duration} month(s) `,
                })
              }
            );
            await ProgramService.getFastTrackStatus(patientID).then(
              (task) => {
                data.push({
                  label: "On Fast Track",
                  value: task["Continue FT"] === true ? "Yes" : "No",
                });
              }
            );
            const appointMentObs: Observation[] 
                = await ObservationService.getObservations(
                patientID, ConceptService.getCachedConceptID('appointment date')
            );
            if (appointMentObs.length > 0) {
              const nextAPPT = HisDate.toStandardHisDisplayFormat(appointMentObs[0].value_datetime);
              data.push({
                label: "Next Appointment",
                value: nextAPPT,
              });
            }
            return data
        },
        'PATIENT IDENTIFIERS': () => {
            return [
                {
                  label: "ARV Number",
                  value: patient.getArvNumber(),
                },
                {
                  label: "NPID",
                  value: patient.getNationalID(),
                }
            ]
        },
        'ALERTS': () => getPatientDashboardAlerts(patient),
        'LAB ORDERS': async () => {
            const data: any = []
            await OrderService.getOrders(patient.getID())
                .then((orders) => {
                    const VLOrders = OrderService.getViralLoadOrders(orders);
                    VLOrders.forEach((element) => {
                        data.push({
                            value: OrderService.formatOrders(element),
                            label: ``,
                        });
                    });
                });
            return data
        },
        'OUTCOME': () => {
            return [
                { 
                    label: 'Current Outcome', 
                    value: program.outcome || 'N/A'
                }
            ]
        },
        'GUARDIAN': async () => {
            const req = await RelationshipService
                .getGuardianDetails(
                    patient.getID()
                )
            if (req) {
                return req.map((r: any) => ({
                    label: r.name,
                    value: r.relationshipType,
                }))
            } 
            return []
        }
    }
}

