import { ArtReportService } from "./art_report_service";

export enum CohortVar {
    MOH_CACHE = 'mohCache'
}

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
        const cache = sessionStorage.getItem(CohortVar.MOH_CACHE)
        if (cache) {
            const data = JSON.parse(cache)
            if (data.quarter === this.quarter) {
                return data.values
            }
            if (data.start_date === this.startDate 
                && data.end_date === this.endDate) {
                    return data.values
            }
        }
    }

    cacheCohort(values: any) {
        sessionStorage.setItem(
            CohortVar.MOH_CACHE, 
            JSON.stringify({
                'start_date': this.startDate,
                'end_date': this.endDate,
                'quarter': this.quarter,
                'data': values
        }))
    }

    validateIndicators(validations: Record<string, CohortValidationInterface>, callback: Function) {
        const validate = (values: any) => this.runValidations(validations, values)
        const cachedValues = this.getCachedCohortValues()

        if (cachedValues) return callback(validate(cachedValues))

        const params = this.quarter
            ? this.qaurterRequestParams()
            : this.datePeriodRequestParams()

        const interval = setInterval(async () => {
            const res = await this.requestCohort(params)
            if (res && res.status === 200) {
                const data = await res.json()
                this.cacheCohort(data.values)
                callback(validate(data.values))
                clearInterval(interval)
            } else if (res && ![200, 204].includes(res.status)) {
                callback(['Unable to validate report'])
            }
        }, 3000)
        return -1
    }

    runValidations(
        validations: Record<string, CohortValidationInterface>, 
        cohortValues: any) {
        const errors = []
        for (const i in validations) {
            const indicator = this.getCohortIndicatorValue(i, cohortValues)
            const param = validations[i].param as number
            const condition = validations[i].check(indicator, param)
            if (condition) errors.push(validations[i].error(indicator, param))
        }
        return errors
    }
}
