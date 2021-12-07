import { ArtReportService } from "./art_report_service";

export interface CohortValidationInterface {
    param: number | string;
    error: (indicator: number, param: number) => string;
    check: (indicator: number, param: number) => boolean;
}

export class MohCohortReportService extends ArtReportService {
    regenerate: boolean;
    constructor() {
        super()
        this.regenerate = false
    }

    private cohortUrl() {
        return `programs/${this.programID}/reports/cohort`
    }

    setRegenerate(regenerate: boolean) {
        this.regenerate = regenerate
    }

    getCohortDrillDown(resourceId: string) {
        return ArtReportService.getJson('cohort_report_drill_down', {
            id: resourceId,
            date: this.date,
            'program_id': this.programID
        })
    }

    requestCohort(params: any) {
        return ArtReportService.ajxGet(
            this.cohortUrl(), params
        )
    }

    qaurterRequestParams() {
        return { 
            name: this.quarter, 
            regenerate: this.regenerate 
        }
    }

    datePeriodRequestParams() {
        return {
            name: `Cohort-${this.startDate}-${this.endDate}`,
            'start_date': this.startDate,
            'end_date': this.endDate,
            regenerate: this.regenerate
        }
    }

    getCohortIndicatorValue(indicator: string, cohort: Array<any>) {
        return cohort.filter((c: any) => c.name === indicator)
            .map((c: any) => parseInt(c.contents))[0]
    }

    getCachedCohortValues() {
        const cache = sessionStorage.getItem('mohCohort')
        if (cache) {
            const data = JSON.parse(sessionStorage.mohCohort)
            if (data.quarter === this.quarter) {
                return data.values
            }
            if (data.start_date === this.startDate 
                && data.end_date === this.endDate) {
                    return data.values
            }
        }
    }

    validateCohortIndicators(
        validations: Record<string, CohortValidationInterface>, 
        cohortValues: any) {
        const errors = []
        for (const v in validations) {
            const indicator = this.getCohortIndicatorValue(v, cohortValues)
            const param = validations[v].param as number
            const condition = validations[v].check(indicator, param)
            if (condition) errors.push(validations[v].error(indicator, param))
        }
        return errors
    }
}
