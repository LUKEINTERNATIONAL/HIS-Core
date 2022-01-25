import { AppInterface, GeneralDataInterface } from '@/apps/interfaces/AppInterface';
import HomeOverview from "@/apps/OPD/components/HomeOverview.vue";
import { PRIMARY_ACTIVITIES } from '@/apps/OPD/config/programActivities';
import { REPORTS } from '@/apps/OPD/config/programReports';
import opdRoutes  from '@/apps/OPD/config/routes';
import { PatientProgramService } from '@/services/patient_program_service';
import { AppEncounterService } from "@/services/app_encounter_service"
import PatientAlerts from "@/services/patient_alerts"
import { Observation } from '@/interfaces/observation';
import { OrderService } from '@/services/order_service';
import { RelationshipService } from '@/services/relationship_service';
import { Order } from '@/interfaces/order';

async function onRegisterPatient(patientId: number){
  const program = new PatientProgramService(patientId)
  await program.enrollProgram()

  // Create registration encounter
  const encounter = new AppEncounterService(patientId, 5)

  await encounter.createEncounter()
  await encounter.saveValueCodedObs(
    'Type of patient', 'New Patient'
  )
}

async function formatPatientProgramSummary(data: any) {
  // TODO: refactor core ProgramService to allow programs specify end-points for 
  // getting program information summary
  const nationalID = (data && data.national_id) ? data.national_id : ''
  const hivStatus = (data && data.hiv_status) ? data.hiv_status : ''
  
  return [
    { label: 'Malawi National ID', value: nationalID},
    { label: 'HIV Status', value: hivStatus }
  ]
}

async function getPatientDashboardAlerts(patient: any): Promise<GeneralDataInterface[]>{
  const sideEffects: Observation[] = await PatientAlerts.alertSideEffects(patient.getID())
  const bmi = await patient.getBMI()
  return [
    {
      label: "Side effects",
      value: `${sideEffects.length}`,
    },
    {
      label: "Patient BMI is",
      value: `${bmi.result}`
    }
  ]
}

function orderToString(order: Order) {
  const test = order.tests[0];
  const result = test.result[0];
  const status = OrderService.isHighViralLoadResult(result) ? '(<b style="color: #eb445a;">High</b>)' : ''
  return `${test.name} ${result.value_modifier}${result.value} ${status}`;
}

function confirmationSummary(patient: any, program: any) {
  return {
    'PATIENT IDENTIFIERS': () => ([
      {
        label: "NPID",
        value: patient.getNationalID(),
      }
    ]),
    'ALERTS': () => getPatientDashboardAlerts(patient),
    'LAB ORDERS': async () => {
      const data: any = []
      await OrderService.getOrders(patient.getID())
        .then((orders) => {
          const VLOrders = OrderService.getViralLoadOrders(orders);
          VLOrders.forEach((order) => {
            data.push({
              value: orderToString(order),
              label: ``,
            });
          });
        });
      return data
    },
    'OUTCOME': () => ([
      { 
        label: 'Current Outcome', 
        value: program.outcome || 'N/A'
      }
    ]),
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

const OPD: AppInterface = {
  programID: 14,
  applicationName: 'OPD',
  applicationIcon: 'opd.png',
  applicationDescription: 'Outpatient Program',
  appRoutes: opdRoutes,
  programReports: REPORTS,
  primaryPatientActivites: PRIMARY_ACTIVITIES,
  secondaryPatientActivites: [],
  homeOverviewComponent: HomeOverview,
  onRegisterPatient,
  formatPatientProgramSummary,
  confirmationSummary,
  programPatientIdentifiers: {
    'National ID': {
      id: 28,
      name: 'National ID',
      isPrimary: true,
      useForSearch: true,
      prefix: () => ''
    },
  }
}

export default OPD