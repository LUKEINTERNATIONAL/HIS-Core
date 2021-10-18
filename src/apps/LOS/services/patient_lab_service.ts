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

    async updateOrderSpecimen(orderID: number, specimenID: number) {
        return OrderService.putJson(`lab/orders/${orderID}`,
            {specimen: { 'concept_id': specimenID } }
        )
    }

    printSpecimenLabel(orderID: number) {
        return new PrintoutService()
            .printLbl(`lab/labels/order?order_id=${orderID}`)
    }

    static async getSpecimensForTests(tests: any) {
        const specimens: any = await Promise.all(
            tests.map((t: any) => OrderService.getSpecimens(t.name))
        )
        return this.getCommonSpecimens(specimens)
    }

    private static getCommonSpecimens(specimenList: Array<any>) {
        const commonIndexes: any = {}
        const common: any = []
        specimenList.forEach(specimens => {
            specimens.forEach(({name, ...rest}: any) => {
                const s = {name, ...rest}
                if (!commonIndexes[name]) {
                    commonIndexes[name] = [s]
                } else {
                    commonIndexes[name].push(s)
                }
            })
        })
        for(const i in commonIndexes) {
            if (commonIndexes[i].length >= specimenList.length) {
                common.push(commonIndexes[i][0])
            }
        }
        return common
    }
}
