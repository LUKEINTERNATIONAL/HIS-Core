import { AppEncounterService } from "@/services/app_encounter_service"

export class BPManagementService extends AppEncounterService {
    constructor(patientID: number, providerID: number) {
        super(patientID, 48, providerID) //TODO: Use encounter type reference name'
    }
}