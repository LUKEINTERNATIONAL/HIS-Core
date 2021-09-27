import { Service } from "./service"
import { ProgramService } from "@/services/program_service";
import { Person } from "@/interfaces/person"
import { PersonService } from "@/services/person_service"
import { PersonAttributeService } from '@/services/person_attributes_service'
import { AppEncounterService } from "./app_encounter_service"
import { PatientPrintoutService } from "@/services/patient_printout_service";

export const LAND_MARK_LOCATIONS  = [
    'Catholic Church',
    'CCAP',
    'Seventh Day',
    'Mosque',
    'Primary School',
    'Borehole',
    'Secondary School',
    'College',
    'Market',
    'Football Ground',
    'Other'
]

export class PatientRegistrationService extends Service {
    personId: number
    constructor() {
        super()
        this.personId = 0
    }

    getPersonID() {
        return this.personId
    }

    setPersonID(personID: number) {
        this.personId = personID
    }

    async registerPatient(person: any, personAttributes: any) {
        await this.createPerson(person)
        await this.createPersonAttributes(personAttributes)
        await this.createPatient()
        await this.enrollPatient()
        await this.createRegistrationEncounterObs(person.patient_type)
        await this.printPatient()
    }

    async registerGuardian(person: any) {
        return this.createPerson(person)
    }

    updatePerson(person: any) {
       return new PersonService(person).update(this.personId)
    }

    async createPerson(person: any) {
        const data: Person = await new PersonService(person).create()
        this.personId = data.person_id
        return data
    }

    createPatient() {
        return ProgramService.createPatient(this.personId)
    }

    enrollPatient() {
        return ProgramService.enrollPatient(this.personId)
    }

    async createPersonAttributes(attributes: Array<any>) {
        for(const index in attributes) {
            await PersonAttributeService.create({
                ...attributes[index],
                'person_id': this.personId
            })
        }
    }

    async createRegistrationEncounterObs(patientType: string) {
        const encounter = new AppEncounterService(this.personId, 5)
        await encounter.createEncounter()
        await encounter.saveValueCodedObs('Type of patient', patientType)
    }

    printPatient() {
        return new PatientPrintoutService(this.personId).printNidLbl()
    }
}
