import { ArtReportService } from "./art_report_service";

export class PatientReportService extends ArtReportService {
    constructor() {
        super()
    }

    getMissedAppointments() {
        return this.getReport('missed_appointments')
    }

    getPregnantWomen() {
        return this.getReport(`/programs/${this.programID}/reports/pregnant_patients`)
    }
}
