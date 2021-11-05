import { AppEncounterService } from "@/services/app_encounter_service";
import { ConceptService } from "@/services/concept_service";

export class PatientTypeService extends AppEncounterService {
  patientType: string
  constructor(patientID: number, providerID: number) {
    super(patientID, 5, providerID);
    this.patientType = 'N/A'
  }

  getType() {
    return this.patientType
  }

  static getPatientTypes() {
    return ConceptService
      .getConceptsByCategory('art_patient_type')
      .sort((a: any,  b: any) => a.order < b.order ? 0 : 1)
      .map(({name }: any) => ({ label: name, value: name }))
  }

  async loadPatientType() {
    const pType = await this.getFirstValueCoded('Type of patient')

    if (pType) this.patientType = pType
  }

  saveLocationClinic(clinic: string) {
    return this.saveValueTextObs('Art clinic location', clinic)
  }

  savePatientType(type: string) {
    return this.saveValueCodedObs('Type of patient', type)
  }
}