import { ConceptName } from "@/interfaces/conceptName";
import { DrugInterface } from "@/interfaces/Drug";
import { AppEncounterService } from "@/services/app_encounter_service"
import { DrugOrderService } from "@/services/drug_order_service";
import { isEmpty } from "lodash";

export const DRUG_DOSE_FREQUENCIES: Record<number, string> = {
  1: "OD", 
  2: "BD",
  3: "TDS", 
  4: "QID"
}

export const ANTI_MALARIA_DRUGS = [
  {
    'drug_id': 236,
    'duration': 3,
    'tabs': 6,
    'name': "Lumefantrine + Arthemether 1 x 6",
    'dose_strength': 1.0,
    'units': "tabs",
    'frequency': 2
  },
  {
    'drug_id': 237,
    'duration': 3,
    'tabs': 12,
    'name': "Lumefantrine + Arthemether 2 x 6",
    'dose_strength': 2.0,
    'units': "tabs",
    'frequency': 2
  },
  {
    'drug_id': 238,
    'duration': 3,
    'tabs': 18,
    'name': "Lumefantrine + Arthemether 3 x 6",
    'dose_strength': 3.0,
    'units': "tabs",
    'frequency': 2
  },
  {
    'drug_id': 239,
    'duration': 3,
    'tabs': 24,
    'name': "Lumefantrine + Arthemether 4 x 6",
    'dose_strength': 4.0,
    'units': "tabs",
    'frequency': 2
  }
];

export class DrugPrescriptionService extends AppEncounterService {
  drugs: ConceptName[] = [];
  constructor(patientID: number, providerID: number) {
    super(patientID, 25, providerID) 
  }
  async loadDrugs(filter = '') {
    this.drugs = await DrugPrescriptionService.getJson('drugs', {
      'page_size': 1000000,
      name: filter
    })
  }
  getDrugOptions() {
    if(isEmpty(this.drugs)) return []
    return this.drugs.map(drug => ({
      label: drug.name, value: drug.name, other: drug
    }))
  }
  async hasMalaria() {
    const malariaTestResult = await this.getMalariaTestResult()
    if(malariaTestResult) return true
    const malariaDiagnosis = await this.getMalariaDiagnosis()
    if(malariaDiagnosis) return true
    return false
  }
  async getMalariaTestResult() {
    let malariaTestResult = await AppEncounterService.getFirstValueCoded(this.patientID, 'Malaria Test Result')   
    if(malariaTestResult) return malariaTestResult
    malariaTestResult = await AppEncounterService.getFirstValueText(this.patientID, 'Malaria Test Result')
    if(malariaTestResult) return malariaTestResult
    return null
  }
  async getMalariaDiagnosis() {
    return AppEncounterService.getFirstValueCoded(this.patientID, 'Malaria')
  }
  createDrugOrder(drugOrders: Array<DrugInterface>){
    return DrugOrderService.create({
      'encounter_id': this.encounterID,
      'drug_orders': drugOrders
    })
  }
}