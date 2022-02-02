<template>
    <his-standard-form :skipSummary="true" :cancelDestinationPath="cancelDestination" :fields="fields"/>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Field, Option } from "@/components/Forms/FieldInterface"
import { toastWarning, alertConfirmation } from "@/utils/Alerts"
import { DispensationService } from "@/apps/ART/services/dispensation_service"
import {isEmpty } from 'lodash'
import EncounterMixinVue from '../../../../views/EncounterMixin.vue'
import HisDate from "@/utils/Date"

export default defineComponent({
    mixins: [EncounterMixinVue],
    data: () => ({
        dispensation: {} as any
    }),
    watch: {
        patient: {
            async handler(patient: any){
                this.dispensation = new DispensationService(patient.getID(), this.providerID)
                await this.dispensation.loadDrugManagementEnabled()
                await this.dispensation.loadCurrentDrugOrder()
                await this.dispensation.loadDrugHistory()

                this.fields = this.getFields()
            },
            deep: true
        }
    },
    methods: {
        saveDispensations(item: Option) {
            const dispensations = this.buildDispensations(item)
            return this.dispensation.saveDispensations(dispensations)    
        },
        buildDispensations(item: Option) {
            if (!isEmpty(item.other?.dispenses)) {
                let dispenses: any = []
                item.other.dispenses.forEach(([tabs, packs]: Array<number>) => {
                    dispenses = [...dispenses, 
                    ...this.dispensation.buildDispensations(
                        item.other.order_id, tabs, packs
                    )]
                })
                return dispenses
            }
            return this.dispensation.buildDispensations(
                item.other.order_id, parseInt(item.value.toString()), 1
            )
        },
        buildMedicationHistory() {
            return this.dispensation.getDrugHistory()
            .sort((a: any, b: any) => {
                const dateA: any = new Date(a.order.start_date)
                const dateB: any = new Date(b.order.start_date)
                return dateB - dateA
            })
            .map((d: any) => ({
                medication: d.drug.name,
                date: HisDate.toStandardHisDisplayFormat(d.order.start_date),
                amount: d.quantity
            }))
        },
        buildOrderOptions() {
            return this.dispensation.getCurrentOrder().map((d: any) => ({
                label: d.drug.name,
                value: d.quantity || 0,
                other: {
                    'order': d,
                    'drug_id': d.drug.drug_id,
                    'order_id': d.order.order_id,
                    'available_stock': d.available_stock || '-',
                    'amount_needed': this.calculateCompletePack(d),
                    'pack_sizes': this.getPackSizesRows(d.drug.drug_id, d.available_stock || 0),
                }
            }))
        },
        getPackSizesRows(drugId: number, availableStock: number) {
            const packs = this.dispensation.getDrugPackSizes(drugId)
            return packs.map((packSize: number) => {
                const packs = availableStock > 0 ? (Math.floor(availableStock / packSize)) : '-'
                return [packSize, packs, 0, 0]
            })
        },
        calculateCompletePack(order: any) {
            const units = parseFloat(order.amount_needed) - (order.quantity || 0)
            if(units <= 0) return 0
            return this.dispensation.calcCompletePack(order, units)
        },
        isDoneDispensing(orders: Array<Option>) {
            return orders.map(o => o.value != 0).every(Boolean)
        },
        async isValidDispensation(option: Option) {
            let isOk = true
            const totalTabs = parseInt(option.value.toString())
            const amountNeeded = option.other['amount_needed']
            const percentageGiven = (totalTabs / amountNeeded) * 100

            if (percentageGiven > 110) {
                isOk = await alertConfirmation('Are you sure you want to dispense over 110% of the prescribed pill count?')
            }

            if (percentageGiven < 100) {
                isOk = await alertConfirmation('Are you sure you want to dispense less than 100% of the prescribe amount?')
            }
            return isOk
        },
        getFields(): Array<Field> {
            return [
                {
                    id: 'dispenses',
                    helpText: 'Dispensation',
                    type: FieldType.TT_DISPENSATION_INPUT,
                    onValueUpdate: async(i: Option, l: Array<Option>) => {
                        if (i.value != -1 && this.isDoneDispensing(l)) {
                            return this.$router.push({name: 'appointment'})
                        }
                        i.other['amount_needed'] = 0
                        
                        await this.dispensation.loadCurrentDrugOrder()

                        return this.buildOrderOptions()
                    },
                    onValue: async (i: Option, isBarcodeScanned: boolean) => {
                        if (i.value  === -1) {
                            const voided = await this.dispensation.voidOrder(i.other.order_id)
                            return !voided
                        }

                        if (!isBarcodeScanned) {
                            const isValidDispensation = await this.isValidDispensation(i)

                            if (!isValidDispensation) return false
                        }

                        const dispensed = await this.saveDispensations(i)

                        if (dispensed) return true

                        toastWarning('Unable to save dispensation')

                        return false
                    },
                    config: {
                        medicationHistory: this.buildMedicationHistory(),
                        toolbarInfo: [
                            { label: 'Name', value: this.patient.getFullName() },
                            { label: 'Gender', value: this.patient.getGender() },
                            { label: 'Date Of Birth', value: HisDate.toStandardHisDisplayFormat(
                                this.patient.getBirthdate()
                            )}
                        ],
                        hiddenFooterBtns: [ 
                            'Clear',
                            'Finish'
                        ]
                    },
                    options: () => this.buildOrderOptions()
                }
            ]
        }
    }
})
</script>
