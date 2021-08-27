import { OrderService } from '@/services/order_service'

export class PatientLabResultService extends OrderService {
    patientID: number;
    testTypeID: number;

    constructor(patientId: number) {
        super()
        this.patientID = patientId
        this.testTypeID = -1
    }

    getTestTypeID() {
        return this.testTypeID
    }

    setTestTypeID(test: number) {
        this.testTypeID = test
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
