import { OrderService } from "@/services/order_service";
import { PrintoutService } from "@/services/printout_service";

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

    async voidOrder(orderID: number, reason: string) {
        return OrderService.void(`lab/orders/${orderID}`,{reason})
    }

    printSpecimenLabel(orderID: number) {
        return new PrintoutService()
            .printLbl(`lab/labels/order?order_id=${orderID}`)
    }
}