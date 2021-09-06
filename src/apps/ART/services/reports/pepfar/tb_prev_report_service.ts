import { Service } from "@/services/service";

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

export class TbPrevReportService extends Service {
    startDate: string;
    endDate: string;
    date: string;
    constructor(startDate: string, endDate: string) {
        super()
        this.startDate = startDate
        this.endDate = endDate
        this.date = Service.getSessionDate()
    }

    getTBPrevReport() {
        return Service.getJson(`/programs/${Service.getProgramID()}/reports/tb_prev2`, {
            'start_date': this.startDate,
            'end_date': this.endDate,
            'date': this.date,
            'program_id': Service.getProgramID(),
        })
    }
}
