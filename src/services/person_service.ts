import { Person } from "@/interfaces/person"
import { Service } from "./service"

export interface NewPerson {
    person_id?: number;
    given_name: string;
    family_name: string;
    gender: string;
    birthdate: string;
    birthdate_estimated: boolean;
    home_district: string;
    home_traditional_authority: string;
    home_village: string;
    current_district: string;
    current_traditional_authority: string;
    current_village: string;
    landmark: string;
    cell_phone_number: string;
    occupation: string;
    facility_name: string;
    patient_type?: string;
    relationship?: string;
}

export class PersonService extends Service{
    person: Person | NewPerson
    constructor(person: NewPerson | Person){
        super()
        this.person = person
    }

    create() { return Service.postJson('/people', this.person) }

    update(id: number) { return Service.putJson(`people/${id}`, {
        ...this.person, 'program_id': Service.getProgramID()
    })}

    static searchFamilyName(name: string) {
        return super.getJson('/search/family_name', {'search_string': name})
    }

    static searchGivenName(name: string) {
        return super.getJson('/search/given_name', {'search_string': name})
    }
}
