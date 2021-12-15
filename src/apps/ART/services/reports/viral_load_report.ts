import Url from "@/utils/Url";
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

    getMaternalStatus(patientIds: number[]) {
        const params = Url.parameterizeObjToString({
            'start_date': this.startDate,
            'end_date': this.endDate,
            'date': this.date,
            'program_id': this.programID,
            'report_definition': 'pepfar'
        })
        return ArtReportService.postJson('vl_maternal_status', patientIds)
    }
}
