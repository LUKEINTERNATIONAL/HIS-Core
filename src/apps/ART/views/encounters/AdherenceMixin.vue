<script lang="ts">
import { defineComponent } from 'vue'
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Field, Option } from "@/components/Forms/FieldInterface"
import { toastWarning } from "@/utils/Alerts"
import { AdherenceService } from "@/apps/ART/services/adherence_service"
import EncounterMixinVue from '../../../../views/EncounterMixin.vue'
import Validation from "@/components/Forms/validations/StandardValidations"
import HisDate from "@/utils/Date"
import { isEmpty } from 'lodash'
export default defineComponent({
    mixins: [EncounterMixinVue],
    data: () => ({
        adherence: {} as any,
        drugObs: [] as any,
        askReasonForPoorAdherence: false,
        calculationAgreementObs: [] as any,
    }),
    methods: {
        async initAdherence(patient: any, provider: number) {
            this.adherence = new AdherenceService(patient.getID(), provider)
            await this.adherence.loadPreviousDrugs()
        },
        async saveAdherence() {
            await this.adherence.createEncounter()
            const data = await Promise.all([...this.drugObs, ...this.calculationAgreementObs])
            const obs = await this.adherence.saveObservationList(data)

            if (!obs) return toastWarning('Unable to save patient observations')
        },
        buildAdherenceReport(data: any) {
            const lastVisit = this.adherence.getReceiptDate()
            const daysElapsed = this.adherence.calculateDaysElapsed(lastVisit)
            const timeElapse = `
                Last visit: ${HisDate.toStandardHisDisplayFormat(lastVisit)} 
                (${daysElapsed} Days Elapsed)
            `
            const rowColors = [{ indexes: [0, 3, 6], class: 'adherence-col-bg' }]
            const cellColors: any = []
            const columns = [timeElapse]
            const rows = [
                ['Prescription'],
                ['Tabs given'],
                ['Tabs per day'],
                ['Tabs remaining'],
                ['Expected'],
                ['Actual (counted)'],
                ['Adherence'],
                ['Doses missed/ Unaccounted for'],
                ['Doses consumed'],
                ['Art Adherence']
            ]        
            data.forEach((order: any, index: number) => {
                const adherenceStatus = this.adherenceStatus(order)
                columns.push(order.drug.name)
                rows[0].push('')
                rows[1].push(order.quantity)
                rows[2].push(order.equivalent_daily_dose)
                rows[3].push('')
                rows[4].push(this.calcPillsExpected(order) < 0 ? 0 : this.calcPillsExpected(order))
                rows[5].push(order.pillsBrought)
                rows[6].push('')
                rows[7].push(this.calcUnaccountedDoses(order))
                rows[8].push(`${this.calcAdherence(order)}%`)
                rows[9].push(adherenceStatus)

                cellColors.push({ 
                    index: index+1,
                    row: 9, 
                    class: adherenceStatus.match(/good/i) ? 'adherence-txt-good' : 'adherence-txt-bad' 
                })
            })
            return [
                { 
                    label: 'Selected Medication', 
                    value:'Table', 
                    other: { columns, rows, rowColors, cellColors }
                }      
            ]
        },
        adherenceStatus(d: any) {
            const adherence = this.calcAdherence(d)
            return this.adherence.isAdherenceGood(adherence) ? 'Good adherence' : 'Explore problem'
        },
        calcAdherence(d: any) {
            const exp = this.calcPillsExpected(d)
            return this.adherence.calculateAdherence(d.quantity, d.pillsBrought, exp)
        },
        calcUnaccountedDoses(d: any) {
            const exp = this.calcPillsExpected(d)
            return this.adherence.calculateUnaccountedOrMissed(exp, d.pillsBrought)
        },
        calcPillsExpected(d: any) {
            return this.adherence.calculateExpected(
                d.quantity, d.equivalent_daily_dose, d.order.start_date
            )
        },
        getAdherenceFields(showFields=true): Array<Field> {
            return [
                {
                    id: 'pills_brought',
                    helpText: 'Pills remaining (brought to clinic)',
                    type: FieldType.TT_ADHERENCE_INPUT,
                    condition: () => showFields,
                    validation: (val: any) => {
                        if (Validation.required(val)) return ['No drugs available']

                        const empty = val.map((i: Option) => i.value === '')
                        
                        return  empty.some(Boolean) ? ['Some values are missing'] : null
                    },
                    unload: async (data: any) => {
                        this.drugObs = []
                        data.forEach(async(val: Option) => {
                            const {drug, order } = val.other
                            const data = { ...val.other, pillsBrought: val.value }
                            const adherence = this.calcAdherence(data)
                            this.drugObs.push(
                                this.adherence.buildAdherenceObs(order.order_id, drug.drug_id, adherence)
                            )
                            this.drugObs.push(
                                this.adherence.buildPillCountObs(order.order_id, val.value)
                            )

                            if (!this.askReasonForPoorAdherence) {
                                this.askReasonForPoorAdherence = !this.adherence.isAdherenceGood(data)
                            }
                        })
                    },
                    options: (fdata: any) => {
                        if (!isEmpty(fdata.pills_brought)) {
                            return fdata.pills_brought
                        }
                        return this.adherence.getLastDrugs().map((data: any) => ({
                            label: data.drug.name,
                            value: '',
                            other: {
                                ...data
                            }
                        }))
                    }
                },
                {
                    id: "adherence_report",
                    helpText: "ART adherence",
                    type: FieldType.TT_TABLE_VIEWER,
                    condition: () => showFields,
                    options: (d: any) => this.buildAdherenceReport(
                        d.pills_brought.map((i: Option) => ({ 
                            ...i.other, pillsBrought: i.value
                        }))
                    ),
                    config: {
                        hiddenFooterBtns: [
                            'Clear'
                        ]
                    }
                },
                {
                    id: "agree_with_calculation",
                    helpText: "Agree with adherence calculation",
                    type: FieldType.TT_SELECT,
                    condition: () => this.askReasonForPoorAdherence && showFields,
                    validation: (val: Option) => Validation.required(val),
                    unload: ({ value }: Option) => {
                        this.calculationAgreementObs = [ this.adherence.buildValueCoded(
                            'Reason for poor treatment adherence', value
                        )]
                    },
                    options: () => [
                        { label: 'Yes', value: 'Yes' },
                        { label: 'No', value: 'No' }
                    ]
                }
            ]
        }
    }
})
</script>
