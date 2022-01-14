import { ArtReportService } from "./art_report_service";

export class TbPrevReportService extends ArtReportService {
    constructor() {
        super()
    }

    getTBPrevReport() {
        return this.getReport(`/programs/${this.programID}/reports/tb_prev2`)
    }
}
