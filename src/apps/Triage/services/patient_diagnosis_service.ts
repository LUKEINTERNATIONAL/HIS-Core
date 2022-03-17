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
        let malariaTestResult = await AppEncounterService.getFirstValueCoded(patientId, 'Malaria Test Result')   
        if(malariaTestResult) return malariaTestResult

        malariaTestResult = await AppEncounterService.getFirstValueText(patientId, 'Malaria Test Result')
        if(malariaTestResult) return malariaTestResult

        return null
    }
}
