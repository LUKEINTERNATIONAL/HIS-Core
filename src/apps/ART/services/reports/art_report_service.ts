import { Service } from "@/services/service";
import HisDate from "@/utils/Date"

export class ArtReportService extends Service {
    programID: number;
    startDate: string;
    endDate: string;
    date: string;

    constructor() {
        super()
        this.endDate = ''
        this.startDate = ''
        this.date = Service.getSessionDate()
        this.programID = Service.getProgramID()
    }

    getDateIntervalPeriod() {
        return `${HisDate.toStandardHisDisplayFormat(this.startDate)} - ${HisDate.toStandardHisDisplayFormat(this.endDate)}`
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
