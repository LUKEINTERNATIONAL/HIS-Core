import { Service } from '@/services/service'
import { isEmpty } from 'lodash';
import { GlobalPropertyService } from './global_property_service'
import { PatientPrintoutService } from './patient_printout_service';
import { Patientservice } from './patient_service';

export class PatientDemographicsExchangeService extends Service {
    patientID: number;
    enabled: boolean;
    constructor() {
        super()
        this.patientID = -1
        this.enabled = false
    }

    setPatientID(patientID: number) {
        this.patientID = patientID
    }

    async loadDDEStatus() {
        this.enabled = await GlobalPropertyService.isProp('dde_enabled=true')
    }

    isEnabled() {
        return this.enabled
    }

    /**
     * Searches DDE for possible match and fallsback to PatientService
     * npid finder
     * @param npid 
     */
    async searchNpid(npid: string) {
        if (this.enabled) {
            const ddeSearch = await this.findNpid(npid)
            if (!isEmpty(ddeSearch) && !isEmpty(ddeSearch.locals)) {
                if (ddeSearch.locals > 1) {
                    throw `NPID has ${ddeSearch.locals.length} duplicates`
                }
                this.patientID = ddeSearch.locals[0].patient_id
                return ddeSearch.locals[0]
            }
        }
        const defaultSearch = await Patientservice.findByNpid(npid)
        return !isEmpty(defaultSearch) ? defaultSearch[0] : {}
    }

    findNpid(npid: string) {
        return Service.getJson('dde/patients/find_by_npid', {
            'npid': npid, 'program_id': Service.getProgramID()  
        })
    }

    shouldCreateNpid(diffs: any) {
        return !isEmpty(diffs) && diffs.npid
    }

    formatDiffValuesByType(
        diffs: Record<string, {remote?: any; local?: any}>, 
        by: 'local' | 'remote') 
        {
            const formatted: any = {}
            for(const i in diffs) {
                formatted[i] = diffs[by]
            }
            return formatted
        }

    diffsToTurple(diffs: any) {
        const turple: any = []
        for(const index in diffs) {
            const diff = diffs[index]
            const label = index
                .split('_')
                .map((word: string) => word.charAt(0)
                    .toUpperCase()+ word.slice(1))
                    .join(' ')
            turple.push([label, diff.local, diff.remote])
        }
        return turple
    }

    shouldUpdateDiffs(diffs: any) {
        return !isEmpty(diffs)
    }

    mergePatients(params: Record<string, any>) {
        return Service.postJson('dde/patients/merge', params)
    }

    reassignNpid(docID: string, patientID: number) {
        return Service.getJson('dde/patients/reassign_npid', {
            'doc_id': docID, 'patient_id': patientID, 
            'program_id': Service.getProgramID()
        })
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

    getLocalAndRemoteDiffs() {
        return Service.getJson('dde/patients/diff', {
            'patient_id': this.patientID, 
            'program_id': Service.getProgramID()
        })
    } 

    updateLocalDifferences(diff: any) {
        return Service.putJson(`people/${this.patientID}`, {
            'program_id': Service.getProgramID(), ...diff
        })
    }

    refreshDemographics() {
        return Service.getJson('dde/patients/refresh', {
            'patient_id': this.patientID, 
            'program_id': Service.getProgramID()
        })
    }
}
