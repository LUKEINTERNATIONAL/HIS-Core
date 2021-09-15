import { ArtReportService } from "./art_report_service";

export class LabReportService extends ArtReportService {
    constructor() {
        super()
        this.programID = 23
    }

    getLabResultsReport() {
        return this.getReport(`lab_test_results`)
    }
}
