import { Service } from "@/services/service";

export class ArtReportService extends Service {
    startDate: string;
    endDate: string;
    programID: number;
    date: string;
    constructor() {
        super()
        this.startDate = ''
        this.endDate = ''
        this.programID = Service.getProgramID()
        this.date = Service.getSessionDate()
    }

    setStartDate(startDate: string) {
        this.startDate = startDate
    }  

    setEndDate(endDate: string) {
        this.endDate = endDate
    }

    getReport(url: string, params={}) {
        return Service.getJson(url, this.buildRequest(params))
    }

    buildRequest(payload: Record<string, any> = {}) {
        return {
            'start_date': this.startDate,
            'end_date': this.endDate,
            'program_id': this.programID,
            'date': this.date,
            ...payload
        }
    }
}