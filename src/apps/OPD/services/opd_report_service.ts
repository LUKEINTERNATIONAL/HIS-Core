import { Service } from "@/services/service";
import HisDate from "@/utils/Date"
import { PrintoutService } from '@/services/printout_service';
import Url from "@/utils/Url";

export interface QuarterInterface {
    name: string;
    start: string;
    end: string;
}

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

export const OTHER_AGE_GROUPS = [
    '<1 year', '1-4 years',
    '5-9 years', '10-14 years',
    '15-19 years', '20-24 years',
    '25-29 years', '30-34 years',
    '35-39 years', '40-44 years',
    '45-49 years', '50 plus years'
]

export const LA_TYPES: Record<string, string> = {
    one: 'AL 1', 
    two: 'AL 2', 
    three: 'AL 3', 
    four: 'LA 4'
}

export const NCD_TYPES = [
    'Diabetes',
    'Hypertension',
    'Stroke',
    'Suspected cancer',
    'Confirmed cancer',
    'Palliative cancer',
    'Asthma',
    'Depression',
    'Acute psychosis',
    'Chronic psychosis',
    'Epilepsy'
]

export class OpdReportService extends Service {
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

    getPatientsWithNIDs() {
        return this.getReport('with_nids')
    }

    getClinicRegistrations(){
        return this.getReport('registration');
    }

    getDrugsGivenWithoutPrescription() {
        return this.getReport('drugs_given_without_prescription')
    }

    getDrugsGivenWithPrescription() {
        return this.getReport('drugs_given_with_prescription')
    }

    getLaPrescriptions(){
        const url = `programs/${this.programID}/reports/la_prescriptions`
        return Service.getJson(url, {
            'start_date': this.startDate,
            'end_date': this.endDate
        })
    }

    printLaReport(data: Record<string, any>){
        const printService = new PrintoutService()
        const url = `programs/${this.programID}/barcodes/la_report`
        const params: Record<string, any> = {
            "date[start]": this.startDate,
            "date[end]": this.endDate
        }
        Object.keys(LA_TYPES).forEach((v, i) => {
            i++
            params[`${i}[prescription]`] = data[`total_la_${v}_prescribed_drugs`]
            params[`${i}[dispensed]`] = data[`total_la_${v}_dispensed_drugs`]
        })
        return printService.printLbl(`${url}?${Url.parameterizeObjToString(params)}`)
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
