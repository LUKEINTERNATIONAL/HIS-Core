import { DrugInterface } from "@/interfaces/Drug";
import { AppEncounterService } from "@/services/app_encounter_service"
import { DrugOrderService } from "@/services/drug_order_service";

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

    getDrugs(){
        return AppEncounterService.getJson('prescriptions');
    }

    createDrugOrder(drugOrders: Array<DrugInterface>){
        return DrugOrderService.create({
            'encounter_id': this.encounterID,
            'drug_orders': drugOrders
        })
    }
}