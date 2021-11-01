import { AppEncounterService } from "@/services/app_encounter_service"
import { ConceptService } from '@/services/concept_service';

export class PatientDiagnosisService extends AppEncounterService {
    constructor(patientID: number, providerID: number) {
        super(patientID, 8, providerID) 
    }

    static async getDiagnosis() {
        const conceptSetId = ConceptService.getConceptID('Qech outpatient diagnosis list')
        return AppEncounterService.getJson('concept_set', {
            id: conceptSetId
        })
    }

    static async getMalariaTestResult(patientId: number) {
        const malariaTestObs = await AppEncounterService.getObs({
            'person_id': patientId,
            'concept_id': ConceptService.getConceptID('Malaria Test Result'),
            'obs_datetime': AppEncounterService.getSessionDate()
        })   
        // TODO -
        // complete the algorithm to check if the current patient
        // has malaria test results
    }
}
