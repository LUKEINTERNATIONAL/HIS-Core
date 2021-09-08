import { ArtReportService } from "./art_report_service";

export const OTHER_AGE_GROUPS = [
    '<1 year', '1-4 years',
    '5-9 years', '10-14 years',
    '15-19 years', '20-24 years',
    '25-29 years', '30-34 years',
    '35-39 years', '40-44 years',
    '45-49 years', '50 plus years'
]

export const AGE_GROUPS = [
    '0-5 months', '6-11 months',
    '12-23 months', '2-4 years', 
    '5-9 years', '10-14 years', 
    '15-17 years', '18-19 years', 
    '20-24 years', '25-29 years',
    '30-34 years', '35-39 years', 
    '40-44 years', '45-49 years',
    '50 plus years'
]

export class TxReportService extends ArtReportService {
    org: string
    constructor() {
        super()
        this.org = 'pepfar'
    }

    setOrg(org: string) {
        this.org = org
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
