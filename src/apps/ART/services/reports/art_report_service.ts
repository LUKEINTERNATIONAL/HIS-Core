import { Service } from "@/services/service";
import HisDate from "@/utils/Date"

export interface QuarterInterface {
    name: string;
    start: string;
    end: string;
}

export class ArtReportService extends Service {
    programID: number;
    startDate: string;
    endDate: string;
    date: string;
    quarter: string
    constructor() {
        super()
        this.endDate = ''
        this.startDate = ''
        this.quarter = ''
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

    setQuarter(quarter: string) {
        this.quarter = quarter
    }

    getReport(url: string, params={}) {
        return Service.getJson(url, this.buildRequest(params))
    }

    buildRequest(config: Record<string, any> = {}) {
        const payload: any = {'date': this.date, 'program_id': this.programID}
        if (this.startDate && this.endDate) {
            payload['start_date'] = this.startDate
            payload['end_date'] = this.endDate
        }
        if (this.quarter) {
            payload['quarter'] = this.quarter
        }
        return { ...payload, ...config }
    }

    static getReportQuarters(minDuration= 4) {
        const quarters: Array<QuarterInterface> = []
        let year = HisDate.getCurrentYear()
        for(let i=0; i < minDuration; ++i) {
            quarters.push({ name: `Q4 ${year}`, start: `${year}-10-01`, end: `${year}-12-31` })
            quarters.push({ name: `Q3 ${year}`, start: `${year}-07-01`, end: `${year}-09-30` })
            quarters.push({ name: `Q2 ${year}`, start: `${year}-04-01`, end: `${year}-06-30` })
            quarters.push({ name: `Q1 ${year}`, start: `${year}-01-01`, end: `${year}-03-31` })
            --year
        }
        return quarters
    }
}
