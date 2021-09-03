import { Service } from "@/services/service";

export class DefaulterReportService extends Service {
    startDate: string;
    endDate: string;
    date: string;
    pepfar: boolean;
    constructor(startDate: string, endDate: string) {
        super()
        this.pepfar = true
        this.startDate = startDate
        this.endDate = endDate
        this.date = Service.getSessionDate()
    }

    getDefaulters() {
        return Service.getJson(`defaulter_list`, {
            'start_date': this.startDate,
            'end_date': this.endDate,
            'date': this.date,
            'program_id': Service.getProgramID(),
            'pepfar': this.pepfar
        })
    }
}
