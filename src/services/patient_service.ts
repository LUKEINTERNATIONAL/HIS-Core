import { Patient } from '@/interfaces/patient';
import { getFullName } from '@/interfaces/name'
import { getPersonAttribute } from '@/interfaces/personAttribute'
import { getPatientIdentifier } from '@/interfaces/patientIdentifier'
import { ObservationService } from './observation_service';
import { ConceptService } from './concept_service';
import { Service } from "@/services/service"
import HisDate from "@/utils/Date"
import {Observation} from "@/interfaces/observation"
import  { BMIService } from "@/services/bmi_service"
import { find, isEmpty } from 'lodash';
import { isValueEmpty } from '@/utils/Strs';

export class Patientservice extends Service {
    patient: Patient;
    constructor(patient: Patient) {
        super()
        this.patient = patient;
    }

    public static mergePatients(payload: any) {
        payload['program_id'] = super.getProgramID()
        return super.postJson('dde/patients/merge', payload)
    }
    
    public static voidPatient(patientID: number, reason='') {
        return super.void(`patients/${patientID}`, { reason })
    }

    public static async search(params: Record<string, string>) {
        return super.getJson(`/search/patients`, params)
    }

    public static findByNpid(npid: string) {
        return super.getJson(`search/patients/by_npid`, { npid })
    }

    public static findByOtherID(idType: string | number, identifier: string | number) {
        return super.getJson('search/patients/by_identifier', {
            'type_id': idType, identifier
        })
    }

    public static async findByID(patientId: number | string) {
        return super.getJson(`/patients/${patientId}`)
    }
    public static async assignNHID(patientId: number | string) {
        return super.postJson(`/patients/${patientId}/npid`, {});
    }
    public static toPatient(json: string): Patient {
        return JSON.parse(json);
    }

    public static patientToJson(value: Patient): string {
        return JSON.stringify(value);
    }

    public static async getPatientVisits(patientId: number, includeDefaulterDates: boolean) {
        const dates: string[] = await super.getJson(`patients/${patientId}/visits`, {
            'program_id': super.getProgramID(),
            'include_defaulter_dates': (includeDefaulterDates == true)
        })
        if (dates) {
            return dates.sort((a, b) => new Date(a) < new Date(b) ? 1 : 0)
        }
        return []
    }

    getWeightLossPercentageFromTrail(trail: any) {
      const [curWeight, prevWeight] = trail.map((w: any) => w.weight)
      if (!(curWeight && prevWeight)) return false
      const decrease = parseFloat(prevWeight) - parseFloat(curWeight)
      const weightLossPercent = (decrease / prevWeight) * 100
      return Math.round(weightLossPercent)
    }

    getGuardian() {
        return Patientservice.getJson(`people/${this.getID()}/relationships`)
    }

    assignNpid() {
       return Patientservice.assignNHID(this.getID()) 
    }

    isMale() {
        return ['Male', 'M'].includes(this.getGender())
    }

    isFemale() {
        return ['Female', 'F'].includes(this.getGender())
    }

    async isPregnant() {
        const obs = await ObservationService.getFirstObs(this.getID(), 'Is patient pregnant')
        return obs && (obs.value_coded.match(/Yes/i) ? true : false) 
            && ObservationService.obsInValidPeriod(obs)
    }

    async hasPregnancyObsToday() {
        const date = await ObservationService.getFirstObsDatetime(this.getID(), 'Is patient pregnant')
        return date && HisDate.toStandardHisFormat(date) === Service.getSessionDate() && this.isFemale()
    }

    isChildBearing() {
        const age = this.getAge()
        return this.isFemale() && age >= 12 && age <= 50
    }

    async getInitialObs(concept: string) {
        try {
            const initialObs = await ObservationService.getAll(
              this.getID(),
              concept
            );
            const lastIndex = initialObs.length - 1;
            return initialObs[lastIndex].value_numeric;
        } catch (e) {
            console.error(e)
        }
    }

    async getInitialWeight() {
        return this.getInitialObs('weight')
    }

    async getRecentWeight() {
        const concept = await ConceptService.getConceptID('weight', true)
        const obs = await ObservationService.getObs({
            'person_id': this.getID(),
            'concept_id': concept,
            'page_size': 1
        })
        return obs.length >= 1 ? obs[0].value_numeric: -1
    }
    
    async getInitialHeight() {
        return this.getInitialObs("Height")
    }

    async getRecentHeight() {
        const concept = await ConceptService.getConceptID('Height', true)
        const obs = await ObservationService.getObs({
            'person_id': this.getID(),
            'concept_id': concept,
            'page_size': 1
        })
        return obs.length >= 1 ? obs[0].value_numeric: -1
    }
    async getWeightHistory() {
        const weights = await ObservationService.getAll(this.getID(), 'weight')
        return weights.map((obs: Observation) => ({
            weight: obs.value_numeric, date: obs.obs_datetime
        }))
    }
    async getCompleteTBTherapyHistory() {
        const data = await ObservationService.getAll(this.getID(), 'TB treatment history')
        return data.filter((data: any) => {
         return data.value_text.match(/Complete/i);
        });
    }

    async getInitialBMI() {
        return this.getInitialObs('BMI')
    }

    async getBMI() {
        //TODO: weight and height should have optional parameters to get weight and height
        const weight = await this.getRecentWeight()
        const height = await this.getRecentHeight()

        if (!(weight && height)) return 0

        const gender = this.isMale() ? 'M' : 'F'
        const bmi: any = await BMIService.getBMI(weight, height, gender, this.getAge())

        return bmi
    }

    async calculateWeightPercentile() {
        const currentWeight = await this.getRecentWeight()
        const medianWeightHeight = await this.getMedianWeightHeight()
        try {
            return (parseFloat(currentWeight) / (parseFloat(medianWeightHeight["weight"])) * 100)
        } catch (e) {
            return 0;
        }
    }

    async getMedianWeightHeight() {
        return Service.getJson(`patients/${this.getID()}/median_weight_height`)
    }

    getObj() {
        return this.patient
    }

    getID() {
        return this.patient.patient_id
    }

    getPatientInfoString() {
        const data =  [
            this.getFullName(),
            `(${this.getGender()})`,
            this.getBirthdate(),
            `, ${this.getCurrentDistrict()}`
        ]
        return data.join(' ')
    }

    getCurrentDistrict() {
        return this.getAddresses().currentDistrict
    }

    getGender() {
        return this.patient.person.gender
    }
    
    getAge() {
        return HisDate.getAgeInYears(this.patient.person.birthdate)
    }

    getAgeInMonths() {
        return this.getAge() * 12
    }

    getBirthdate() {
        return this.patient.person.birthdate
    }

    getGivenName() {
        return this.patient.person.names[0].given_name
    }

    getFamilyName() {
        return this.patient.person.names[0].family_name
    }

    getFullName() {
        return getFullName(this.patient.person.names[0]);
    }

    getDocID() {
        const id = this.findIdentifierByType('DDE person document ID')
        return id.match(/unknown/i) ? null : id
    }

    getNationalID() {
        return this.findIdentifierByType('National id')
    }
    
    getArvNumber() {
        return this.findIdentifierByType('ARV Number')
    }

    hasActiveFilingNumber() {
        return this.hasIdentifierType('Filing number')
    }

    hasDormantFilingNumber() {
        return this.hasIdentifierType('Archived filing number')
    }

    private hasIdentifierType(identifierType: string) {
        const id = find(this.patient.patient_identifiers, { 
            type: { 
                name : identifierType
            }
        })
        return id ? true : false
    }

    getFilingNumber() {
        const finder = this.patient
            .patient_identifiers
            .filter((i: any) => i.type.name === 'Filing number' 
                || i.type.name === 'Archived filing number')
        return !isEmpty(finder) ? finder[0].identifier : ''
    }

    private findIdentifierByType(type: string) {
        const ids = this.patient.patient_identifiers.filter((i: any) => i.type.name === type )
        return ids.length >= 1 ? ids[0].identifier : 'Unknown'
    }

    getIdentifiers() {
        return this.patient.patient_identifiers
    }

    getHomeDistrict() {
        return this.getAddresses().ancestryDistrict
    }

    getHomeTA() {
        return this.getAddresses().ancestryTA
    }

    getHomeVillage() {
        return this.getAddresses().ancestryVillage
    }

    getCurrentVillage() {
        return this.getAddresses().currentVillage;
    }

    getCurrentTA() {
        return this.getAddresses().currentTA
    }
    getPhoneNumber() {
        return this.getAttribute(12) //get phone number
    }
    getAttribute(personAttributeTypeID: number) {
        return getPersonAttribute(this.patient.person.person_attributes, personAttributeTypeID);
    }

    getPatientIdentifier(patientIdentifierTypeID: number) {
        return getPatientIdentifier(this.patient.patient_identifiers, patientIdentifierTypeID);
    }

    patientIsComplete() {
        const attributes = [
            this.getNationalID(),
            this.getGender(),
            this.getBirthdate(),
            this.getGivenName(),
            this.getFamilyName(),
            ...Object.values(this.getAddresses())
        ]
        return attributes.map(
            (a: any) => !isValueEmpty(a)
        ).every(Boolean)
    }

    getAddresses() {
        const addressOBJ = {
            ancestryDistrict: '',
            ancestryTA: '',
            ancestryVillage: '',
            currentDistrict: '',
            currentTA: '',
            currentVillage: '',
        }
        if (this.patient.person.addresses.length > 0) {
            const addresses = this.patient.person.addresses[0];

            addressOBJ.ancestryDistrict = addresses.address2;
            addressOBJ.ancestryTA = addresses.county_district;
            addressOBJ.ancestryVillage = addresses.neighborhood_cell;
            addressOBJ.currentDistrict = addresses.state_province;
            addressOBJ.currentTA = addresses.township_division;
            addressOBJ.currentVillage = addresses.city_village;
        }
        return addressOBJ;
    }

}