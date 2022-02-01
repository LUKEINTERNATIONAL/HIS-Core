import { AppEncounterService } from "@/services/app_encounter_service"

export class TreatmentService extends AppEncounterService {
    constructor(patientID: number, providerID: number) {
        super(patientID, 182, providerID) //TODO: Use encounter type reference name'
    }
}