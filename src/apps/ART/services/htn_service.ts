import { AppEncounterService } from "@/services/app_encounter_service"
import { ObservationService } from "@/services/observation_service"

export class BPManagementService extends AppEncounterService {
    constructor(patientID: number, providerID: number) {
        super(patientID, 48, providerID) //TODO: Use encounter type reference name'
    }
    async getBPTrail() {
        return await AppEncounterService.getJson(`/patients/${this.patientID}/bp_trail`);
    }
    async getCurrentDrugs() {
        return await AppEncounterService.getJson(`/patients/${this.patientID}/current_bp_drugs`);
    }
}