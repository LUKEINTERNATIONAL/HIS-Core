import { ArtReportService } from "./art_report_service";

export class PatientReportService extends ArtReportService {
    constructor() {
        super()
    }

    getPregnantWomen() {
        return this.getReport(`/programs/${this.programID}/reports/pregnant_patients`)
    }
}
