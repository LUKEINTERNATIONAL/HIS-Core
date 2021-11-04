import { Service } from "./service";

export interface DuplicateIdentifiersInterface {
    count: number;
    identifier: string;
}

export class IdentifierService extends Service {
    constructor() {
        super()
    }

    static getIdentifierTypes() {
        return super.getJson('types/patient_identifiers')
    }

    static getDuplicateIndentifiers(idType: number): Promise<DuplicateIdentifiersInterface[]> {
        return super.getJson(`search/identifiers/duplicates`, {
            'type_id': idType
        })
    }
}
