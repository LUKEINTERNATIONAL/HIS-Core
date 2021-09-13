import { ArtReportService } from "./art_report_service";

export class MohCohortReportService extends ArtReportService {
    regenerate: boolean
    constructor() {
        super()
        this.regenerate = false
    }

    getCohort() {
        return ArtReportService.getJson(
            `programs/${this.programID}/reports/cohort`, {
            'start_date': this.startDate,
            'end_date': this.endDate,
            regenerate: this.regenerate
        })
    }
}
