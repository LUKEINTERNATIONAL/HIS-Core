import { ArtReportService } from "./art_report_service";

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

export class DisaggregatedReportService extends ArtReportService {
    ageGroup: string;
    rebuildOutcome: boolean;
    initialize: boolean;
    outComeTable: string;
    gender: string;
    constructor() {
        super()
        this.gender = ''
        this.ageGroup = AGE_GROUPS[0]
        this.initialize = true
        this.rebuildOutcome = true
        this.outComeTable = 'temp_pepfar_patient_outcomes'
    }

    async init() {
        this.initialize = true
        this.rebuildOutcome = true
        const req = await this.getReport('cohort_disaggregated', this.getRequestParams())
        if (req && req.temp_disaggregated === 'created') {
            this.initialize = false
            this.rebuildOutcome = false
            return true
        }
        return false
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

    getRequestParams(params={}) {
        return this.buildRequest({
            'age_group': this.ageGroup,
            'rebuild_outcome': this.rebuildOutcome,
            'initialize': this.initialize,
            ...params
        })
    }

    getCohort() {
        return this.getReport('cohort_disaggregated', this.getRequestParams())
    }

    getTxIpt() {
        return this.getReport('clients_given_ipt', this.getRequestParams({
            'gender': this.gender,
            'outcome_table': this.outComeTable      
        }))
    }

    getTxCurrTB() {
        return this.getReport('screened_for_tb', this.getRequestParams({
            'gender': this.gender,
            'outcome_table': this.outComeTable
        }))
    }
}
