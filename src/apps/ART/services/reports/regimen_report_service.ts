import { ArtReportService } from "./art_report_service";

export class RegimenReportService extends ArtReportService {
    type: string;
    constructor() {
        super()
        this.type = 'pepfar'
    }

    setReportType(type: string) {
        this.type = type
    }

    getRegimenReport() {
        return this.getReport('regimen_report', { type: this.type})
    }

    getRegimenSwitchReport() {
        return this.getReport('regimen_switch', { type: this.type})
    }
}
