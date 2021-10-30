import { Service } from '@/services/service'
import { isEmpty } from 'lodash';
import { GlobalPropertyService } from './global_property_service'
import { PatientPrintoutService } from './patient_printout_service';
import { Patientservice } from './patient_service';
import HisDate from "@/utils/Date"

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

    postMerge(persons: Array<any>) {
        const [primary, ...secondary] = persons.map((p) => {
            return {
                'patient_id': p.patientID,
                'doc_id': p.docID || ''
            }
        })
        this.patientID = primary.patient_id
        return this.mergePatients({
            primary,  secondary,
            'program_id': Service.getProgramID()
        })
    }

    /**
     * Searches DDE for possible match and fallsback to PatientService
     * npid finder
     * @param npid 
     */
    async searchNpid(npid: string): Promise<Array<any>> {
        if (this.enabled) {
            try {
                const ddeSearch = await this.findNpid(npid)
                const results: any = [
                    ...ddeSearch.locals, ...ddeSearch.remotes
                ]
                if (!isEmpty(results)) {
                    this.patientID = results[0].patient_id
                }
                // If local and remote are less than equal two, treat it as one 
                // record and use one result
                return results.length <= 2 
                    ? [results[0]]
                    : results
            } catch(e) {
                console.warn(e)
            }
        }
        return Patientservice.findByNpid(npid)
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
        const formatValue: Function = (label: string, value: string) => {
            // Detect date labels and format them
            return typeof value === 'string' && label.match(/date/i) 
                ? HisDate.toStandardHisDisplayFormat(value)
                : value
        }
        for(const index in diffs) {
            const diff = diffs[index]
            const label = index
                .split('_')
                .map((word: string) => word.charAt(0)
                    .toUpperCase()+ word.slice(1))
                    .join(' ')
            turple.push([
                label, 
                formatValue(index, diff.local), 
                formatValue(index, diff.remote)
            ])
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
        return Service.postJson('dde/patients/reassign_npid', {
            'program_id': Service.getProgramID(),
            'patient_id': patientID,
            'doc_id': docID
        })
    }

    createNPID(npid: string) {
        return Service.postJson('patient_identifiers', {
            'identifier': npid,
            'patient_id': this.patientID,
            'identifier_type': 3
        })
    }

    printNpid(id=this.patientID) {
        return new PatientPrintoutService(id).printNidLbl()
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
