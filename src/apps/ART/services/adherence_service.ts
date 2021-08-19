import { AppEncounterService } from "@/services/app_encounter_service"
import { DrugInterface } from "@/interfaces/Drug"
import HisDate from "@/utils/Date"

export class AdherenceService extends AppEncounterService {
    lastDrugs: Array<DrugInterface>
    lastReceiptDate: string
    constructor(patientID: number, providerID: number) {
        super(patientID, 68, providerID) //TODO: Use encounter type reference name
        this.lastDrugs = []
        this.lastReceiptDate = ''
    }

    async loadPreviousDrugs() {
        const date = new Date(this.date)
        date.setDate(date.getDate() - 1) // we don't want current date to count

        const drugs = await AppEncounterService.getJson(
            `patients/${this.patientID}/drugs_received`, {
                date: HisDate.toStandardHisFormat(date)
            }
        )

        if (!drugs) return

        this.lastDrugs = drugs.filter((drug: DrugInterface) => {
            if (!this.lastReceiptDate) {
                this.lastReceiptDate = drug.order.start_date
                return true
            }
            return new Date(drug.order.start_date) >= new Date(this.lastReceiptDate)
        })
    }

    getReceiptDate() { return this.lastReceiptDate }

    getLastDrugs() { return this.lastDrugs }

    buildPillCountObs(orderId: number, pillCount: number) {
        return this.buildValueNumber('Number of tablets brought to clinic', pillCount, null, orderId)
    }

    async buildAdherenceObs(orderId: number, drugId: number, adherence: number) {
        const concept = await AppEncounterService.getConceptID('Drug adherence', true)
        return {
            'concept_id': concept,
            'value_numeric': adherence,
            'value_drug': drugId,
            'value_modifier': '%',
            'order_id': orderId,
            'person_id': this.patientID,
            'obs_datetime': AppEncounterService.getSessionDate()
        }
    }

    isAdherenceGood(adherence: number) {
        return adherence >= 95 && adherence <= 105
    }

    calculateAdherence(given: number, pills: number, expected: number) {
        return Math.round(100 * (given - pills) / (given - expected));
    }

    calculateExpected(given: number, equivalentDailyDose: number, startDate: string) {
        const daysGone = this.calculateDaysElapsed(startDate);
        return (given - (daysGone * parseFloat(equivalentDailyDose.toString())));
    }

    calculateDaysElapsed(date1: string) {
        // Based on Old ART algorithm reused to maintain parity...
        const date2 = AppEncounterService.getSessionDate()
        const timeDiff = Math.abs(new Date(date2).getTime() - new Date(date1).getTime());
        const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return diffDays;
    }

    calculateUnaccountedOrMissed(expected: string, actual: string) {
        const exp = (parseFloat(expected) - parseFloat(actual));
        return (exp < 0 ? ((exp * -1) + ' missed') : (exp + ' unacc'));
    }
}
