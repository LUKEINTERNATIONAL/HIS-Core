import { ConceptService } from './concept_service'
import HisDate from '@/utils/Date'
import { isEmpty }  from "lodash"

export interface ObsValue {
    concept_id: number;
    value_text?: string;
    value_coded?: number;
    value_datetime?: string;
    value_modifier?: string | null;
    value_boolean?: string;
    value_numeric?: number;
    obs_datetime?: string;
}

export interface Observation {
    encounter_id: number;
    observations: Array<ObsValue>;
}

export class ObservationService extends ConceptService {
    constructor() {
        super()
    }

    static create(data: Observation) {
        return super.postJson('/observations', data)     
    }

    static saveObs(encounterId: number, obs: ObsValue) {
        return this.create({
            'encounter_id': encounterId,
            observations: [obs]
        })
    }
    
    static saveObsArray(encounterId: number, obs: Array<ObsValue>) {
        return this.create({
            'encounter_id': encounterId,
            observations: obs
        })
    }

    static async buildValueCoded(conceptName: string, valueCoded: string, date=this.getSessionDate()) {
        const concept = await ConceptService.getConceptID(conceptName, true)
        const coded = await ConceptService.getConceptID(valueCoded, true)
        return {
            'concept_id': concept,
            'value_coded': coded,
            'obs_datetime': date
        }
    }

    static async buildValueText(conceptName: string, valueText: string, date=this.getSessionDate()) {
        const concept = await ConceptService.getConceptID(conceptName, true)
        return {
            'concept_id': concept,
            'value_text': valueText,
            'obs_datetime': date
        }
    }

    static async buildValueNumber(
        conceptName: string, 
        value: number, 
        modifier: string | null = null, 
        orderId: number | null = null, 
        date=this.getSessionDate()) {
            const concept = await ConceptService.getConceptID(conceptName, true)
            const payload = {
                'concept_id': concept,
                'value_numeric': value,
                'obs_datetime': date
            }
            if (modifier) 
                Object.assign(payload, {'value_modifier': modifier})
            if (orderId) 
                Object.assign(payload, {'order_id': orderId})
            return payload
    }

    static async buildValueDate(conceptName: string, valueDate: string, date=this.getSessionDate()) {
        const concept = await ConceptService.getConceptID(conceptName, true)
        return {
            'concept_id': concept,
            'value_datetime': valueDate,
            'obs_datetime': date
        }
    }

    // Deprecated: use getObs instead
    static getObservations(patientID: number, conceptID: number) {
        return super.getJson(`/observations?person_id=${patientID}&concept_id=${conceptID}`)
    }

    static getObs(params: Record<string, string | number>) {
        return super.getJson('/observations', params)
    }

    static async getAll(patientID: number, conceptName: string, date=this.getSessionDate(), strictMode=true){
        const concept = await ConceptService.getConceptID(conceptName, strictMode)
        const obs = await this.getObs({
            'person_id':  patientID, 
            'concept_id': concept,
            'date': date,
        })

        if (!isEmpty(obs)) return obs
    }

    static async getFirstValueText(patientID: number, conceptName: string, date=this.getSessionDate(), strictMode=true) {
        const concept = await ConceptService.getConceptID(conceptName, strictMode)
        const obs = await this.getObs({
            'person_id':  patientID, 
            'concept_id': concept,
            'date': date,
            'page_size': 1
        })

        if (!isEmpty(obs)) return obs[0].value_text
    }

    static async getFirstValueCoded(patientID: number, conceptName: string, date=this.getSessionDate(), strictMode=true) {
        const concept = await ConceptService.getConceptID(conceptName, strictMode)
        const obs = await this.getObs({
            'person_id':  patientID, 
            'concept_id': concept,
            'date': date,
            'page_size': 1
        })
        if (!isEmpty(obs) && obs[0].value_coded) {
            return ConceptService.getConceptName(obs[0].value_coded)
        } 
    }
    static async getFirstValueNumber(patientID: number, conceptName: string, date=this.getSessionDate(), strictMode=true) {
        const concept = await ConceptService.getConceptID(conceptName, strictMode)
        const obs = await this.getObs({
            'person_id':  patientID, 
            'concept_id': concept,
            'date': date,
            'page_size': 1
        })
        if (!isEmpty(obs)) return obs[0].value_numeric
    }
    static async resolvePrimaryValue(obs: any) {
        let value: string | number = ''

        if (obs.value_datetime != null) {
            value = HisDate.toStandardHisDisplayFormat(obs.value_datetime)
        }

        if (obs.value_text != null) {
            value = obs.value_text
        }
        
        if (obs.value_numeric != null) {
            value = obs.value_numeric
        }

        if (obs.value_coded != null) {
            value = await super.getConceptName(obs.value_coded)
        }

        if (obs.value_modifier != null) {
            value = `${value} ${obs.value_modifier}`
        }

        return value
    }
}
