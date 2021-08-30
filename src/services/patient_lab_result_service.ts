import { OrderService } from '@/services/order_service'
import { AppEncounterService } from './app_encounter_service';

export class PatientLabResultService extends AppEncounterService {
    patientID: number;
    testTypeID: number;
    resultDate: string;
    testID: number;
    constructor(patientId: number) {
        super(patientId, 57)
        this.patientID = patientId
        this.testTypeID = -1
        this.resultDate = ''
        this.testID = -1
    }

    createLabResult(measures: Array<any>) {
        return AppEncounterService.postJson(`lab/tests/${this.testID}/results`, {
            'encounter_id': this.encounterID,
            date: this.resultDate,
            measures
        })
    }

    getTestID() {
        return this.testID
    }

    getTestTypeID() {
        return this.testTypeID
    }

    setTestTypeID(test: number) {
        this.testTypeID = test
    }

    setResultDate(date: string) {
        this.resultDate = date
    }

    setTestID(test: number) {
        this.testID = test
    }   

    getTestsWithoutResults() {
        return OrderService.getOrders(this.patientID, {
            status: 'drawn'
        })
    }

    getTestIndicators() {
      return OrderService.getJson(
        `lab/test_result_indicators`, {
        'test_type_id': this.testTypeID
      })
    }

    
}
