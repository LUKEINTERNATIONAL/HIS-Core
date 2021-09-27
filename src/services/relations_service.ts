import { Service } from "./service";

export class RelationsService extends Service {
    constructor() {
        super()
    }

    static getRelations() {
        return super.getJson('types/relationships')
    }

    static createRelation(patientA: number, patientB: number, relationType: number) {
        return super.postJson(`people/${patientA}/relationships`, {
            'relationship_type_id': relationType,
            'relation_id': patientB
        })
    }
}
