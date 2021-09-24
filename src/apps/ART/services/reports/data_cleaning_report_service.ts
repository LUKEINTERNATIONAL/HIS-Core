import { ArtReportService } from "./art_report_service";

export const INDICATORS = [
    'DOB MORE THAN DATE ENROLLED',
    'CLIENTS WITH ENCOUNTERS AFTER DECLARED DEAD',
    'DOB MORE THAN DATE ENROLLED',
    'DATE ENROLLED LESS THAN EARLIEST START DATE',
    'MALE CLIENTS WITH FEMALE OBS',
    'PRESCRIPTION WITHOUT DISPENSATION',
    'MISSING DEMOGRAPHICS',
    'MISSING START REASONS',
    'MULTIPLE START REASONS',
    'PRE ART OR UNKNOWN OUTCOMES'
]

export class DataCleaningReportService extends ArtReportService {
    constructor() {
        super()
    }

    getCleaningToolReport(reportName: string) {
        return this.getReport('art_data_cleaning_tools', { 
            'report_name' : reportName 
        })
    }
}
