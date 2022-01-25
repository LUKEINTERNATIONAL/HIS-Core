import { Service } from "./service"

export class PatientIdentifierService extends Service { 
    constructor() {
        super()
    }

    static create(patientId: number, nidType: number, nid: string) { 
      return super.postJson('patient_identifiers', {
        identifier: nid,
        'identifier_type': nidType, 
        'patient_id': patientId
    })
  }
}
