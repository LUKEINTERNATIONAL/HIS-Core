import { ArtReportService } from "./art_report_service";

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

    async requestCohort(params: any) {
        const req: any = await ArtReportService.ajxGet(
            this.cohortUrl(), params
        )
        if (req.ok) {
            if(this.regenerate === true) {
                this.regenerate = false
                params.regenerate = false
            }
            if (req.status === 204) {
                await this.requestCohort(params)
            } else {
                const res = await req?.json()
                return res
            }
        } else {
            throw 'An error has occured'
        }
    }

    getCohortDrillDown(resourceId: string) {
        return ArtReportService.getJson('cohort_report_drill_down', {
            id: resourceId,
            date: this.date,
            'program_id': this.programID
        })
    }

    getCohortByQuarter() {
        return this.requestCohort({ 
            name: this.quarter, 
            regenerate: this.regenerate 
        })
    }

    getCohortByDates() {
        return this.requestCohort({
            name: `Cohort-${this.startDate}-${this.endDate}`,
            'start_date': this.startDate,
            'end_date': this.endDate,
            regenerate: this.regenerate
        })
    }
}
