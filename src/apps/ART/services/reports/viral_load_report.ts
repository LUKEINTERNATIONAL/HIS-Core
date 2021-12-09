import { ArtReportService } from "./art_report_service";

export class ViralLoadReportService extends ArtReportService {
    constructor() {
        super()
    }
    
    getVLCoverage() {
        return this.getReport(`programs/${this.programID}/reports/viral_load_coverage`, {
            'rebuild_outcomes': true
        })
    }
}
