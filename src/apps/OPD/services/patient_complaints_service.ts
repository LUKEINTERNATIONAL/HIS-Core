import { AppEncounterService } from "@/services/app_encounter_service"
import { ConceptService } from '@/services/concept_service';

export class PatientComplaintsService extends AppEncounterService {
  constructor(patientID: number, providerID: number) {
    super(patientID, 122, providerID) 
  }

  static async getComplaintsList(complaintType: string, filter = '') {
    return ConceptService.getConceptSet(complaintType, filter) 
  }
}
