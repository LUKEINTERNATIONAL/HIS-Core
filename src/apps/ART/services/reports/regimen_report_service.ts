import { ArtReportService } from "./art_report_service";

export const REGIMENS = [
    '0A', '2A', '4A', '5A', '6A', '7A', '8A', '9A', '10A', '11A', '12A', '13A', '14A', '15A', '16A', '17A'
]
export const FORMULATIONS = [
    'pellets',
    'tablets',
    'granules'
]

export class RegimenReportService extends ArtReportService {
    type: string;
    constructor() {
        super()
        this.type = 'pepfar'
    }

    setReportType(type: string) {
        this.type = type
    }

    getTptNewInitiations() {
        return this.getReport(`programs/${this.programID}/reports/tpt_newly_initiated`)
    }

    getRegimenFormulationReport(regimen: string, formulation: string) {
        return this.getReport(`programs/${this.programID}/reports/regimens_and_formulations`, { regimen, formulation })
    }

    getRegimenReport() {
        return this.getReport('regimen_report', { type: this.type})
    }

    getRegimenSwitchReport() {
        return this.getReport('regimen_switch', { type: this.type})
    }
}
