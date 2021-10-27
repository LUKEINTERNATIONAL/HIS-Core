import { Service } from '@/services/service'

export class DemographicsExchangeService extends Service {
    constructor() {
        super()
    }

    static findByNpid(patientID: number) {
        return super.getJson('dde/patients/find_by_npid', {
            'npid': patientID, 'program_id': super.getProgramID()  
        })
    }
}
