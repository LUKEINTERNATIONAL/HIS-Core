import { ArtReportService } from "./art_report_service";

export class StockReportService extends ArtReportService {
    stock: Array<any>;
    constructor() {
        super()
        this.stock = []
    }   

    async loadStock() {
        this.stock = await ArtReportService.getJson(`pharmacy/items`, { paginate: false })
    }
    async loadTrail() {
        return await ArtReportService.getJson(`pharmacy/audit_trail`, { paginate: false })
    }
    /**Code adapted from BHT-Core Art system */
    groupStock() {
        const pharmacyData: any = {};
        for (const index in this.stock) {
            const data = this.stock[index]
            const drugId = data["drug_id"];

            if (!pharmacyData[drugId]) {
                pharmacyData[drugId] = {
                    'current_quantity': 0,
                    'expiry_dates': [],
                    'pack_size': data.pack_size,
                    'drug_name': data["drug_name"] === null ? data["drug_legacy_name"] : data["drug_name"]
                }
            }

            if (data.current_quantity === 0) continue;

            pharmacyData[drugId]["current_quantity"] += parseFloat(data.current_quantity);
            pharmacyData[drugId]["expiry_dates"].push(data["expiry_date"]);
        }
        return Object.values(pharmacyData).map((drug: any) => {
            let currentQuantity: any = '0'
            if(drug.pack_size == null) {
                currentQuantity  = drug.current_quantity + '(tabs)';
            }else {
                currentQuantity = Math.trunc(drug.current_quantity / drug.pack_size);
            }
            const expiryDate = drug.expiry_dates.sort((a: any, b: any) => +new Date(a) - +new Date(b))[0]
            return {
                drugName: drug.drug_name,
                currentQuantity,
                expiryDate
            }
        })
    }
}
