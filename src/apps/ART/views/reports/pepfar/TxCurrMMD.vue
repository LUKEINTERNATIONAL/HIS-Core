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
import { TxReportService, OTHER_AGE_GROUPS } from '@/apps/ART/services/reports/pepfar/tx_report_service'

export default defineComponent({
    mixins: [ReportMixin],
    async created() {
        this.fields = this.getFields()
    },
    data: () => ({
        cohort: {} as any,
        malesData: {} as any,
        femaleData: {} as any
    }),
    methods: {
        init(startDate: string, endDate: string) {
            this.report = new TxReportService(startDate, endDate)
        },
        getColumns() {
            return  [
                '#',
                'Age group',
                'Gender',
                '# of clients on < 3 months of ARVs',
                '# of clients on 3 - 5 months of ARVs',
                '# of clients on  >= 6 months of ARVs'
            ]
        },
        getValues(patients: Record<string, Array<any>>) {
            const underThreeMonths: Array<any> = []
            const betweenThreeAndFiveMonths: Array<any> = []
            const overSixMonths: Array<any> = []

            for (const patientId in patients) {
                const data: any = patients[patientId]
                const pDays = data.prescribed_days

                if(pDays < 90) {
                    underThreeMonths.push(patientId)
                }

                if (pDays >= 90 && pDays <= 150) {
                    betweenThreeAndFiveMonths.push(patientId)
                }

                if (pDays > 150) {
                    overSixMonths.push(patientId)
                }
            }
            return [
                this.buildDrillableLink(underThreeMonths),
                this.buildDrillableLink(betweenThreeAndFiveMonths),
                this.buildDrillableLink(overSixMonths)
            ]
        },
        async buildTableRows() {
            let minAge = 0
            let maxAge = 0
            const femaleRows = []
            const maleRows = []
            for(const i in OTHER_AGE_GROUPS) {
                const group = OTHER_AGE_GROUPS[i]
                if (group === '<1 year') {
                    minAge = 0
                    maxAge = 0
                } else if (group === '50 plus years') {
                    minAge = 50
                    maxAge = 120
                } else {
                    const [min, max] = group.split('-')
                    minAge = parseInt(min)
                    maxAge = parseInt(max)
                }
                const res = await this.report.getTxCurrMMDReport(minAge, maxAge)
                if (res) {
                    femaleRows.push([
                        group,
                        'Female',
                        ...this.getValues(res['Female'])
                    ])
                    maleRows.push([
                        group,
                        'Male',
                        ...this.getValues(res['Male'])
                    ])
                } else {
                    femaleRows.push([group, 'Female', 0, 0, 0])
                    maleRows.push([group, 'Male', 0, 0, 0])
                }
            }
            return [...femaleRows, ...maleRows].map(
                (d: any, i: number) => {
                    d.unshift(1+i)
                    return d
                })
        },
        getFields(): Array<Field> {
            return [
                ...this.getDateDurationFields(),
                {
                    id: 'report',
                    helpText: 'PEPFAR TX CURR MMD report',
                    type: FieldType.TT_TABLE_VIEWER,
                    options: async (_: any, c: any) => {
                       this.init(c.start_date, c.end_date)
                       const rows = await this.buildTableRows()
                       const columns = this.getColumns()
                       return [{
                           label: '', 
                           value: '',
                           other: {
                                rows, 
                                columns
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
                            'Clear',
                            'Back'
                        ],
                        styles: ['his-table', 'table-borders']
                    }
                }
            ]
        }
    }
})
</script>
