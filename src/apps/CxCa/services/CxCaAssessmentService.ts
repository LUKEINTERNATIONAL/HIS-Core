import { AppEncounterService } from "@/services/app_encounter_service"

export class AssessmentService extends AppEncounterService {
    constructor(patientID: number, providerID: number) {
        super(patientID, 181, providerID) //TODO: Use encounter type reference name'
    }
}