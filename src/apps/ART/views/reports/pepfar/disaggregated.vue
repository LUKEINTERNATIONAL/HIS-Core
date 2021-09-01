<template>
    <his-standard-form 
        :skipSummary="true" 
        :fields="fields" 
        @onFinish="onSubmit"
    />
</template>
<script lang='ts'>
import { defineComponent } from 'vue'
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Field } from "@/components/Forms/FieldInterface"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { DisaggregatedReportService, AGE_GROUPS } from "@/apps/ART/services/reports/pepfar/disaggregated_service"
import { toastWarning } from '@/utils/Alerts'
import { isEmpty } from "lodash"

export default defineComponent({
    mixins: [ReportMixin],
    data: () => ({
        rows: [] as Array<any>
    }),
    created() {
        this.fields = this.getFields()
    },
    watch: {
        async endDate(endDate: string) {
            if (endDate) {
                await this.init(this.startDate, endDate)    
            }
        }
    },
    methods: {
        async init(startDate: string, endDate: string){
            this.report = new DisaggregatedReportService(startDate, endDate)
            const isInit = await this.report.init()
            if (isInit) {
                await this.setRows()
            } else {
                toastWarning ('Unable to initialise report')
            }
        },
        async getValue(prop: string, gender: string, data: any) {
            if (prop === 'txt_given_ipt') {
               const ipt = await this.report.getTxIpt()
               if (ipt) {
                   return ipt.length
               }  
            }
            if (prop === 'tx_screened_for_tb') {
                const tb = await this.report.getTxCurrTB()
                if (tb) {
                    return tb.length
                }
            }
            return gender in data ? data[gender][prop].length : 0
        },
        async setRows() {
            this.rows = []
            const data: any = { 'F': AGE_GROUPS, 'M': AGE_GROUPS }

            for (const genderIndex in data) {
                const ageGroups = data[genderIndex]
                this.report.setRebuildOutcome(true)

                for (const ageIndex in ageGroups) {
                    const rowNumber = parseInt(ageIndex)+1
                    const gender = genderIndex === 'M' ? 'Male' : 'Female'
                    const ageGroup: any = ageGroups[ageIndex]

                    let row = [rowNumber, ageGroup, gender]
                    this.report.setGender(gender.toLowerCase())
                    this.report.setAgeGroup(ageGroup)

                    const res = await this.report.getCohort()
                    this.report.setRebuildOutcome(false)

                    if (!isEmpty(res)) {
                        const value = (prop: string) => this.getValue(prop, genderIndex, res[ageGroup])
                        row = await Promise.all([
                            ...row, 
                            value('tx_new'),
                            value('tx_curr'),
                            value('tx_given_ipt'),
                            value('tx_screened_for_tb')
                        ])
                    } else {
                        row = [...row, 0, 0, 0, 0]
                    }
                    this.rows.push(row)
                }
            }
        },
        getFields(): Array<Field> {
            return [
                ...this.getDateDurationFields(),
                {
                    id: 'report',
                    helpText: 'ART disaggregated report',
                    type: FieldType.TT_TABLE_VIEWER,
                    options: () => {
                       return [{
                           label: '',
                           value: '',
                           other: {
                               rows: this.rows,
                               columns: [
                                   '#',
                                   'Age group',
                                   'Gender',
                                   'Tx new (new on ART)',
                                   'Tx curr (receiving ART)',
                                   'TX curr (received IPT)',
                                   'TX curr (screened for TB)'
                                ]
                           }
                       }] 
                    },
                    config: {
                        footerBtns: [
                            {
                                name: 'Rebuild Outcomes',
                                size: 'large',
                                slot: 'start',
                                color: 'success',
                                visibleOnStateChange: (state: any) => {
                                    return state.field.id === 'report'
                                }
                            }
                        ],
                        hiddenFooterBtns: [
                            'Cancel',
                            'Clear'
                        ],
                        styles: ['his-table', 'table-borders']
                    }
                }
            ]
        }
    }
})
</script>
