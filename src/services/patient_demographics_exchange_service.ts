import { Service } from '@/services/service'
import { isEmpty } from 'lodash';
import { GlobalPropertyService } from './global_property_service'
import { PatientPrintoutService } from './patient_printout_service';

export class PatientDemographicsExchangeService extends Service {
    patientID: number;

    constructor(patientID: number) {
        super()
        this.patientID = patientID
    }

    shouldCreateNpid(diffs: any) {
        return !isEmpty(diffs) && diffs.npid
    }

    shouldUpdateDiffs(diffs: any) {
        return !isEmpty(diffs)
    }

    createNPID(npid: string) {
        return Service.postJson('patient_identifiers', {
            'identifier': npid,
            'patient_id': this.patientID,
            'identifier_type': 3
        })
    }

    printNpid() {
        return new PatientPrintoutService(this.patientID).printNidLbl()
    }

    findNpid() {
        return Service.getJson('dde/patients/find_by_npid', {
            'npid': this.patientID, 'program_id': Service.getProgramID()  
        })
    }

    getLocalAndRemoteDiffs() {
        return Service.getJson('dde/patients/diff', {
            'patient_id': this.patientID, 
            'program_id': Service.getProgramID()
        })
    } 

    updateLocalDifferences(diff: any) {
        return Service.putJson(`people/${this.patientID}`, {
            'program_id': Service.getProgramID(),
            ...diff
        })
    }

    refreshDemographics() {
        return Service.getJson('dde/patienbts/refresh', {
            'patient_id': this.patientID, 
            'program_id': Service.getProgramID()
        })
    }

    static isEnabled() {
        return GlobalPropertyService.isProp('dde_enabled=true')
    }
}
