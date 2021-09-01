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
        cohort: {} as any
    }),
    async created() {
        this.fields = this.getFields()
    },
    methods: {
        async init(startDate: string, endDate: string){
            this.report = new DisaggregatedReportService(startDate, endDate)
            return this.report.init()
        },
        async getValue(prop: string, gender: string, data: any) {
            if (prop === 'tx_given_ipt') {
               const ipt = await this.report.getTxIpt()
               if (ipt) {
                   return this.buildDrillableLink(ipt)
               }
            } else if (prop === 'tx_screened_for_tb') {
                const tb = await this.report.getTxCurrTB()
                if (tb) {
                    return this.buildDrillableLink(tb)
                }
            } 
            return gender in data ? this.buildDrillableLink(data[gender][prop]) : this.buildDrillableLink([])
        },
        async getRowsByGender(gender: 'F' | 'M') {
            const genderProps: any = { F: 'Female', M: 'Male'}
            const strGender = genderProps[gender]
            const rows = []
            this.report.setGender(strGender.toLowerCase())

            for (const i in AGE_GROUPS) {
                const rowNumber = parseInt(i) + 1
                const ageGroup: any = AGE_GROUPS[i]
                this.report.setAgeGroup(ageGroup)

                let row = [rowNumber, ageGroup, strGender]

                if (!(ageGroup in this.cohort)) {
                    const req = await this.report.getCohort()
                    this.cohort[ageGroup] = !isEmpty(req) ? req[ageGroup] : {}
                }
                if (!isEmpty(this.cohort[ageGroup])) {
                    const value = (prop: string) => this.getValue(prop, gender, this.cohort[ageGroup])
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
                rows.push(row)
            }
            return rows
        },
        getFields(): Array<Field> {
            return [
                ...this.getDateDurationFields(),
                {
                    id: 'report',
                    helpText: 'ART disaggregated report',
                    type: FieldType.TT_TABLE_VIEWER,
                    options: async (_: any, c: any) => {
                       this.cohort = {}
                       const isInit = await this.init(c.start_date, c.end_date)
                       if (!isInit) {
                           toastWarning('Unable to initialise report')
                           return [] 
                       }
                       const femaleRows = await this.getRowsByGender('F')
                       const maleRows = await this.getRowsByGender('M')
                       const rows = await Promise.all([...femaleRows, ...maleRows])
                       return [{
                           label: '', 
                           value: '',
                           other: {
                               rows,
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
