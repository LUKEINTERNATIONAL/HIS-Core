import { ArtReportService } from "./art_report_service";
import Url from "@/utils/Url";

export class TxReportService extends ArtReportService {
    org: string
    constructor() {
        super()
        this.org = 'pepfar'
    }

    setOrg(org: string) {
        this.org = org
    }

    getTxMMDClientLevelData(patients: Array<number>) {
        const params = Url.parameterizeObjToString({
            'start_date': this.startDate,
            'end_date': this.endDate,
            'program_id': this.programID,
            'date': this.date,
            'org': this.org
        })
        const url = `tx_mmd_client_level_data?${params}`
        return ArtReportService.postJson(url, { 'patient_ids': patients })
    }

    remapTxClientLevelData(clientData: Array<any>) {
        return clientData.map((d: any) => {
            let patient: any = null
            const drugs: Array<any> = []
            for(const regimenID in d) {
                const data: any = Object.values(d[regimenID])
                data.forEach((regimen: any) => {
                    for (const regimenIndex in regimen) {
                        const order = regimen[regimenIndex]
                        if (!patient) {
                            patient = {
                                id: order.arv_number,
                                dob: order.birthdate,
                                dispenseDate: order.start_date,    
                            }
                        }
                        drugs.push({
                            name: order.drug_name, 
                            quantity: order.quantity,
                            dose: order.dose_per_day
                        })
                    }
                })
            }
            return { ...patient, drugs }
        })
    }

    getTxCurrMMDReport(minAge: number, maxAge: number) {
        return this.getReport('arv_refill_periods', {
            'org': this.org,
            'min_age': minAge,
            'max_age': maxAge
        })
    }

    getTxMlReport() {
        return this.getReport('tx_ml')
    }

    getTxRttReport() {
        return this.getReport('tx_rtt')
    }
}
