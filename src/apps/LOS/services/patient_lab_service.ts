import { OrderService } from "@/services/order_service";

export class PatientLabService extends OrderService  {
    patientID: number;
    date: string;

    constructor(patientID: number) {
        super()
        this.patientID = patientID
        this.date = OrderService.getSessionDate()
    }

    setDate(date: string) {
        this.date = date
    }

    getOrders(status: 'drawn' | 'ordered') {
        return OrderService.getOrders(
            this.patientID, {
                status,
                date: this.date
            })
    }
}