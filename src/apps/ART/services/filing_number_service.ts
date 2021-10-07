import { Service } from "@/services/service";
import { PrintoutService } from "@/services/printout_service";
import { GlobalPropertyService } from "@/services/global_property_service";
import { Patientservice } from "@/services/patient_service";

export class FilingNumberService extends Service {
    patientID: number;
    activePrefix: string;
    dormantPrefix: string;

    constructor() {
        super()
        this.patientID = 0
        this.activePrefix = ''
        this.dormantPrefix = ''
    }

    getActivePrx() {
        return this.activePrefix
    }

    getDormantPrx() {
        return this.dormantPrefix
    }

    getPatientID() {
        return this.patientID
    }

    setPatientID(patientID: number) {
        this.patientID = patientID
    }

    async loadFilingPrefix() {
        const prx = await GlobalPropertyService.get('filing.number.prefix')
        if (prx) {
            const [activePrefix, dormantPrefix] = prx.split(',')
            this.activePrefix = activePrefix
            this.dormantPrefix = dormantPrefix
        }
    }

    isActiveFilingNum(filingNumber: string) {
        return filingNumber.match(new RegExp(this.activePrefix, 'i'))
            ? true
            : false
    }

    isDormantFilingNum(filingNumber: string) {
        return filingNumber.match(new RegExp(this.dormantPrefix, 'i'))
            ? true
            : false
    }

    async assignFilingNumber() {
        return Service.postJson(`patients/${this.patientID}/filing_number`, {})
    }

    async canUseFilingNumber() {
        const req = await Service.getJson('filing_number/type=activate')
        if (req && req['use.filing.numbers'] === 'true') {
            return true
        }
        return false
    }

    async getFilingNumber(filingNumber: string) {
        const identifier = `${this.dormantPrefix}${filingNumber}`
        const res = await Service.getJson(`search/patients/by_identifier`, {
            'type_id': 18, 'identifier': identifier
        })
        if (res) {
            return res.map((person: any) => {
                const patient = new Patientservice(person)
                return {
                    identifier,
                    'given_name': patient.getGivenName(),
                    'family_name': patient.getFamilyName(),
                    'state': 'N/A',
                    'appointment_date': ''
                }
            })
        }
        return []
    }

    archiveFilingNumber() {
        return Service.getJson(`archive_active_filing_number`, {
            'patient_id': this.patientID
        })
    }

    archivePatient(secondaryPatient: number, identifier: string | number) {
        return Service.postJson('swap_active_number', {
            'primary_patient_id': this.patientID,
            'secondary_patient_id': secondaryPatient,
            identifier
        })
    }

    getArchivingCandidates(page=0, pageSize=10) {
        return Service.getJson(`archiving_candidates`, {
            page,'page_size': pageSize
        })
    }

    getPastFilingNumbers() {
        return Service.getJson(`patients/${this.patientID}/past_filing_numbers`)
    }

    printFilingNumber() {
        const printer = new PrintoutService()
        return printer.printLbl(`patients/${this.patientID}/labels/filing_number`) 
    }
}