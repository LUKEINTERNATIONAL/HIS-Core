import { Service } from "@/services/service";

export class RegimenReportService extends Service {
    startDate: string;
    endDate: string;
    date: string;
    type: string;
    constructor(startDate: string, endDate: string) {
        super()
        this.type = 'pepfar'
        this.startDate = startDate
        this.endDate = endDate
        this.date = Service.getSessionDate()
    }

    getRegimenReport() {
        return Service.getJson(`regimen_report`, {
            'start_date': this.startDate,
            'end_date': this.endDate,
            'date': this.date,
            'program_id': Service.getProgramID(),
            'type': this.type
        })
    }
}
