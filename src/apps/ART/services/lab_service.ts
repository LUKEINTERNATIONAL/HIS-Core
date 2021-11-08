import { AppEncounterService } from "@/services/app_encounter_service";
export class LabService extends AppEncounterService {
  constructor(patientID: number, providerID: number) {
    super(patientID, 13, providerID);
  }
}