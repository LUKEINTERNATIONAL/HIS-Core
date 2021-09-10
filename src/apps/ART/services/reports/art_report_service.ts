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

    static getReportQuarters(minDuration= 4) {
        const quarters = []
        let year = HisDate.getCurrentYear()
        for(let i=0; i < minDuration; ++i) {
            quarters.push({ quarter: `Q4 ${year}`, start: `${year}-10-01`, end: `${year}-12-31` })
            quarters.push({ quarter: `Q3 ${year}`, start: `${year}-07-01`, end: `${year}-09-30` })
            quarters.push({ quarter: `Q2 ${year}`, start: `${year}-04-01`, end: `${year}-06-30` })
            quarters.push({ quarter: `Q1 ${year}`, start: `${year}-01-01`, end: `${year}-03-31` })
            --year
        }
        return quarters
    }
}
