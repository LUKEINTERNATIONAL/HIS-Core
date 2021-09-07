import { ArtReportService } from "./art_report_service";

export class PatientReportService extends ArtReportService {
    constructor() {
        super()
    }

    getClientsDueForVl() {
        return this.getReport('clients_due_vl')
    }

    getClientRentention() {
        return this.getReport(`/programs/${this.programID}/reports/retention`)
    }

    getExternalConsultationClients() {
        return this.getReport('external_consultation_clients')
    }

    getMissedAppointments() {
        return this.getReport('missed_appointments')
    }

    getPregnantWomen() {
        return this.getReport(`/programs/${this.programID}/reports/pregnant_patients`)
    }
}
