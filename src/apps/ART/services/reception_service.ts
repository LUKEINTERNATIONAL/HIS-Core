import { AppEncounterService } from "@/services/app_encounter_service"
import { ProgramService } from "@/services/program_service";
import { GlobalPropertyService } from "@/services/global_property_service";

export class ReceptionService extends AppEncounterService {
    sitePrefix: string
    constructor(patientID: number, providerID: number) {
        super(patientID, 51, providerID) //TODO: Use encounter type reference name'
        this.sitePrefix = ''
    }

    getSitePrefix() {
        return this.sitePrefix
    }

    async loadSitePrefix() {
        this.sitePrefix = await GlobalPropertyService.getSitePrefix();
    }

    createArvNumber(identifier: string) {
        return ProgramService.postJson("/patient_identifiers/", {
            'patient_id': this.patientID,  
            'identifier_type': 4,
            identifier,
        })
    }

    buildArvNumber(arv: number) {
        return `${this.sitePrefix}-ARV-${arv}`    
    }
}
