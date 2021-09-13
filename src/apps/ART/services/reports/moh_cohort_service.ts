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

    getCohortDrillDown(resourceId: string) {
        return ArtReportService.getJson('cohort_report_drill_down', {
            id: resourceId,
            date: this.date,
            'program_id': this.programID
        })
    }

    getCohortByQuarter() {
        return ArtReportService.getJson(this.cohortUrl(), { name: this.quarter })
    }

    getCohortByDates() {
        return ArtReportService.getJson(this.cohortUrl(), {
            name: `Cohort-${this.startDate}-${this.endDate}`,
            'start_date': this.startDate,
            'end_date': this.endDate
        })
    }
}
