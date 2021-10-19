import { modalController } from "@ionic/vue";
import ActivitiesModal from "@/apps/ART/Components/ActivitiesSelection.vue";
import { PRIMARY_ACTIVITIES } from "./ArtProgramActivities";
import {TaskInterface} from "./../../interfaces/TaskInterface"
import { WorkflowService } from "@/services/workflow_service"
import PatientAlerts from "@/services/patient_alerts"
import { RelationshipService } from "@/services/relationship_service";
import { ProgramService } from "@/services/program_service";
import { OrderService } from "@/services/order_service";
import { Observation } from "@/interfaces/observation";
import { ObservationService } from "@/services/observation_service";
import { ConceptService } from "@/services/concept_service"
import HisDate from "@/utils/Date"
import { GeneralDataInterface } from "@/apps/interfaces/AppInterface";
import { AppEncounterService } from "@/services/app_encounter_service"

export async function init() {
    const activities = PRIMARY_ACTIVITIES
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
    return modal;
}

export async function onRegisterPatient(patientID: number, person: any) {
    const enroll = await ProgramService.enrollPatient(patientID)
    if (enroll) {
        // TODO: Change state to Pre-ART
    }
    // Create registration encounter
    const encounter = new AppEncounterService(patientID, 5)
    await encounter.createEncounter()
    await encounter.saveValueCodedObs(
        'Type of patient', person.patient_type
    )
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

