import { AppEncounterService } from "@/services/app_encounter_service";

export class PatientTypeService extends AppEncounterService {
  patientType: string
  constructor(patientID: number, providerID: number) {
    super(patientID, 5, providerID);
    this.patientType = 'N/A'
  }

  getType() {
    return this.patientType
  }

  async loadPatientType() {
    const pType = await this.getFirstValueCoded('Type of patient')

    if (pType) this.patientType = pType
  }

  savePatientType(type: string) {
    return this.saveValueCodedObs('Type of patient', type)
  }
}