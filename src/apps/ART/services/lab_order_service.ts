import { AppEncounterService } from "@/services/app_encounter_service";
export class LabOrderService extends AppEncounterService {
  constructor(patientID: number, providerID: number) {
    super(patientID, 57, providerID);
  }
}