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

export class DrugPrescriptionService extends AppEncounterService {
  constructor(patientID: number, providerID: number) {
    super(patientID, 25, providerID) 
  }
  async getDrugs(filter: string) {
    const data = await DrugPrescriptionService.getJson('drugs', {
      'page_size': 100000,
      name: filter
    })
    return this.mapToOptions(data)
  }
  mapToOptions(drugs: ConceptName[]){
    if(isEmpty(drugs)) return []
    return drugs.map(drug => ({
      label: drug.name, value: drug.name, other: drug
    }))
  }
  createDrugOrder(drugOrders: Array<DrugInterface>){
    return DrugOrderService.create({
      'encounter_id': this.encounterID,
      'drug_orders': drugOrders
    })
  }
}