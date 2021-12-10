import { ArtReportService } from "./art_report_service";

export enum CtIndicator {
    DobMoreThanEnrolledDate = 'DOB MORE THAN DATE ENROLLED',
    ClientsWithEncountersAfterDeath = 'CLIENTS WITH ENCOUNTERS AFTER DECLARED DEAD',
    DobMoreThanDateEnrolled = 'DOB MORE THAN DATE ENROLLED',
    DateEnrolledLessThanEarliestStartDate = 'DATE ENROLLED LESS THAN EARLIEST START DATE',
    MalesWithFemaleObs = 'MALE CLIENTS WITH FEMALE OBS',
    PrescriptionWithoutDispensation = 'PRESCRIPTION WITHOUT DISPENSATION',
    MissingDemographics = 'MISSING DEMOGRAPHICS',
    MissingStartReasons = 'MISSING START REASONS',
    MultipleStartReasons = 'MULTIPLE START REASONS',
    PreArtOrUnknownOutcomes ='PRE ART OR UNKNOWN OUTCOMES'
}

export class DataCleaningReportService extends ArtReportService {
    constructor() {
        super()
    }

    getCleaningToolReport(indicator: CtIndicator) {
        return this.getReport('art_data_cleaning_tools', { 
            'report_name' : indicator 
        })
    }

    getEnrolledOnArtBeforeBirth() {
        return ArtReportService.getJson('enrolled_on_art_before_birth')
    }
}
