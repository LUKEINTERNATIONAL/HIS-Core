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

export class DisaggregatedReportService extends Service {
    startDate: string;
    endDate: string;
    date: string;
    quarter: string;
    ageGroup: string;
    rebuildOutcome: boolean;
    initialize: boolean;
    outComeTable: string;
    gender: string;

    constructor(startDate: string, endDate: string) {
        super()
        this.startDate = startDate
        this.endDate = endDate
        this.date = Service.getSessionDate()
        this.gender = ''
        this.ageGroup = AGE_GROUPS[0]
        this.quarter = 'pepfar'
        this.initialize = true
        this.rebuildOutcome = true
        this.outComeTable = 'temp_pepfar_patient_outcomes'
    }

    setAgeGroup(ageGroup: string) {
        this.ageGroup = ageGroup
    }

    setInitialization(isInit: boolean) {
        this.initialize = isInit
    }

    setRebuildOutcome(isRebuild: boolean) {
        this.rebuildOutcome = isRebuild
    }

    setGender(gender: string) {
        this.gender = gender
    }

    buildRequest() {
        return {
            'date': this.date,
            'quarter': this.quarter,
            'start_date': this.startDate,
            'end_date': this.endDate,
            'age_group': this.ageGroup,
            'rebuild_outcome': this.rebuildOutcome,
            'initialize': this.initialize,
            'program_id': Service.getProgramID()
        }
    }

    async init() {
        const req = await Service.getJson('cohort_disaggregated', this.buildRequest())
        if (req && req.temp_disaggregated === 'created') {
            this.initialize = false
            this.rebuildOutcome = false
            return true
        }
        return false
    }

    getCohort() {
        return Service.getJson('cohort_disaggregated', this.buildRequest())
    }

    getTxIpt() {
        const payload = { 
            ...this.buildRequest(),
            'gender': this.gender,
            'outcome_table': this.outComeTable
        }
        return Service.getJson('clients_given_ipt', payload)
    }

    getTxCurrTB() {
        const payload = { 
            ...this.buildRequest(),
            'gender': this.gender,
            'outcome_table': this.outComeTable
        }
        return Service.getJson('screened_for_tb', payload)
    }
}
