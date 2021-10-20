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
    async getLastDrugs() {
        return await AppEncounterService.getJson(`/patients/${this.patientID}/last_bp_drugs_dispensation`);
    }
    async getAdherence(drugID: number, pills: number) {
        return await AppEncounterService.postJson(`/patients/${this.patientID}/remaining_bp_drugs`, {
            'drug_id': drugID,
            pills: pills
        });
    }
}