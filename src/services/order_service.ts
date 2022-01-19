import { Order } from '@/interfaces/order';
import { Service } from '@/services/service'
import HisDate from "@/utils/Date"
import { ConceptService } from './concept_service';
export class OrderService extends Service {
    constructor() {
        super()
    }
    static create(data: any) {
        return super.postJson('/lab/orders', data)     
    }
    static getOrders(patientID: number, params = {}) {
        return super.getJson('/lab/orders', {
            'patient_id': patientID,
            ...params
        });
    }

    static getTestTypes() {
        return super.getJson('/lab/test_types');
    }

    static getTestTypesBySpecimen(specimenType='') {
        return super.getJson('/lab/test_types', {
            'specimen_type': specimenType
        });
    }

    static getSpecimens(testName: string) {
        return super.getJson('/lab/specimen_types', { 'test_type': testName });
    }

    static getViralLoadOrders(orders: Order[]) {
        return orders.filter(order => {
            try {
                const result = order.tests[0].result;
                if (!Array.isArray(result)) return false
                return order.tests.length > 0 && order.tests[0].result.length > 0;
            } catch (error) {
                console.log(error);
            }

        });
    }
    static formatOrders(order: Order) {
        const test = order.tests[0];
        const result = test.result[0];
        const resultDate = HisDate.toStandardHisFormat(result.date);
        const status = this.isHighViralLoadResult(result) ? "(High)" : ""
        return `${test.name} ${result.value_modifier}${result.value} ${status} ${resultDate}`;
    }

    static isHighViralLoadResult(result: any) {
        if(result.value_modifier === '=' && parseFloat(result.value) >= 1000) return true

        if((result.value_modifier  === '<' || result.value_modifier  === '&lt') 
            && parseFloat(result.value) > 1000
        )  return true

        if((result.value_modifier  === '>' || result.value_modifier  === '&gt') 
            && (parseFloat(result.value) >= 1000 || result.value.toUpperCase().replace(/\s+/g, '') == 'LDL')
        )  return true

        return false
    }

    static formatLabs(orders: Order[]) {
        const formatted = [];
        for (let x = 0; x < orders.length; x++) {
            const accessionNumber = orders[x].accession_number;
            const testStatus = (orders[x].specimen.name == "Unknown" ? "N/A" : orders[x].specimen.name);
            const dateOrdered = orders[x].order_date;
            const tests = orders[x].tests;

            for (let i = 0; i < tests.length; i++) {
                const results = (tests[i].result ? tests[i].result : []);
                const resultsArr = [];
                let resultDate = '';

                for (let r = 0; r < results.length; r++) {
                    resultDate = (results[r].date == null ? "" : `${results[r].date}`);
                    const name = results[r].indicator.name;
                    const value = results[r].value;
                    const valueModifier = results[r].value_modifier === '<' ? '&lt;' : results[r].value_modifier;
                    resultsArr.push(name + "   " + valueModifier + value);
                }
                formatted.push({
                    'accession_number': accessionNumber,
                    'test_name': tests[i].name,
                    specimen: testStatus,
                    ordered: HisDate.toStandardHisFormat(dateOrdered),
                    result: resultsArr,
                    released: HisDate.toStandardHisFormat(resultDate)
                })

            }
        }
        return formatted;
    }
    static buildLabOrders(encounter: any, orders: any) {
        return orders.map((data: any) => {
            const testReason = ConceptService.getCachedConceptID(data.reason, true);
            const payload: any = {
                'encounter_id': encounter.encounter_id,
                'tests': [{ 'concept_id': data.concept_id }],
                'reason_for_test_id': testReason,
                'target_lab': super.getLocationName(),
                'date': HisDate.toStandardHisFormat(super.getSessionDate()),
                'requesting_clinician': super.getUserName(),
            }
            if (data.specimenConcept) {
                payload['specimen'] = {
                    'concept_id': data.specimenConcept
                }
            }
            return payload
        })
    }
    static saveOrdersArray(encounterId: number, orders: Array<Order>) {
        return this.create({
            'encounter_id': encounterId,
            orders: orders
        })
    }
}