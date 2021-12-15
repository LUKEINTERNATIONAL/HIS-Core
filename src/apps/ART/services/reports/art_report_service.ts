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

    static getQuarterBounds(year: number) {
        return {
            'Q1': {
                qtr: 1,
                start: `${year}-01-01 00:00`,
                end: `${year}-03-31 00:00`
            },
            'Q2': {
                qtr: 2,
                start: `${year}-04-01 00:00`,
                end: `${year}-06-30 00:00`
            },
            'Q3': {
                qtr: 3,
                start: `${year}-07-01 00:00`,
                end: `${year}-09-31 00:00`
            },
            'Q4': {
                qtr: 4,
                start: `${year}-10-01 00:00`,
                end: `${year}-12-31 00:00`
            }
        }
    }

    static getQtrByDate(date: Date) {
        const qtrBounds: any = this.getQuarterBounds(date.getFullYear())
        for(const qtr in qtrBounds) {
            const { start, end } = qtrBounds[qtr]
            if (date >= new Date(start) && date <= new Date(end)) {
                return qtrBounds[qtr]
            }
        }
        return null
    }

    static buildQtrObj(qtrName: string, year: number): QuarterInterface {
        const qtrBounds: any = this.getQuarterBounds(year)
        const { start, end } = qtrBounds[qtrName]
        return {
            start,
            end,
            name: `${qtrName} ${year}`,
        }
    }

    static getReportQuarters(maxQuarters=5) {
        const qtrs: QuarterInterface[] = [];
        let currDate = new Date();
        let currYear = currDate.getFullYear();
        const curYr = currYear
        
        currDate = new Date(`${curYr}-${currDate.getMonth() + 1}-${currDate.getDate()} 00:00`);
        const currentQtr = this.getQtrByDate(currDate);
        let qtr = currentQtr.qtr;
        let i = 0;

        if (qtr === 4) {
            qtrs.push(this.buildQtrObj('Q1', currYear + 1))
        }

        while (i < maxQuarters) {
          qtrs.push(this.buildQtrObj(`Q${qtr}`, currYear))
          qtr = qtr > 0 ? (qtr -= 1) : qtr;
          currYear = qtr == 0 ? currYear - 1 : currYear;
          qtr =  qtr == 0 ? ( qtr += 4) : qtr;
          i++;
        }
        return qtrs;
    }
}
