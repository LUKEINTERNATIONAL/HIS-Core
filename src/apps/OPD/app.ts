import { AppInterface } from '@/apps/interfaces/AppInterface';
import HomeOverview from "@/apps/OPD/components/HomeOverview.vue";
import { PRIMARY_ACTIVITIES } from '@/apps/OPD/config/programActivities';
import { REPORTS } from '@/apps/OPD/config/programReports';
import opdRoutes  from '@/apps/OPD/config/routes';
import { PatientProgramService } from '@/services/patient_program_service';
import { AppEncounterService } from "@/services/app_encounter_service"

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