import { Service } from "@/services/service";

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

export class TxReportService extends Service {
    startDate: string;
    endDate: string;
    date: string;
    constructor(startDate: string, endDate: string) {
        super()
        this.startDate = startDate
        this.endDate = endDate
        this.date = Service.getSessionDate()
    }

    getTxCurrMMDReport(minAge: number, maxAge: number) {
        return Service.getJson(`arv_refill_periods`, {
            'start_date': this.startDate,
            'end_date': this.endDate,
            'date': this.date,
            'program_id': Service.getProgramID(),
            'org': 'pepfar',
            'min_age': minAge,
            'max_age': maxAge
        })
    }

    getTxMlReport() {
        return Service.getJson(`tx_ml`, {
            'start_date': this.startDate,
            'end_date': this.endDate,
            'date': this.date,
            'program_id': Service.getProgramID(),
        })
    }

    getTxRttReport() {
        return Service.getJson(`tx_rtt`, {
            'start_date': this.startDate,
            'end_date': this.endDate,
            'date': this.date,
            'program_id': Service.getProgramID(),
        })
    }
}
