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
import { TxReportService, AGE_GROUPS } from '@/apps/ART/services/reports/pepfar/tx_report_service'

export default defineComponent({
    mixins: [ReportMixin],
    async created() {
        this.fields = this.getFields()
    },
    data: () => ({
        cohort: {} as any
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
                'Defaulted (new registration)',
                'Defaulted (old registration)',
                'Died',
                'Stopped',
                'Tranferred out',
                'Unknown'
            ]
        },
        async buildTableRows(data: any) {
            this.cohort = data
            const femaleRows = await this.buildRows('F')
            const maleRows = await this.buildRows('M')
            return femaleRows.concat(maleRows)
        },
        async buildRows(gender: string) {
            const rows = []
            let counter = 1
            for(const i in AGE_GROUPS) {
                const group = AGE_GROUPS[i]
                try {
                    const cohortData = this.cohort[group][gender]
                    const drillable = cohortData.map((d: Array<number>) => this.buildDrillableLink(d))
                    rows.push([
                        counter,
                        group,
                        gender,
                        ...drillable
                    ])
                }catch(e) {
                    rows.push([counter, group, gender, 0, 0, 0, 0, 0, 0])
                }
                ++counter
            }
            return rows
        },
        getFields(): Array<Field> {
            return [
                ...this.getDateDurationFields(),
                {
                    id: 'report',
                    helpText: 'PEPFAR TX ML report',
                    type: FieldType.TT_TABLE_VIEWER,
                    options: async (_: any, c: any) => {
                       this.init(c.start_date, c.end_date)
                       const data = await this.report.getTxMlReport()
                       const rows = await this.buildTableRows(data)
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
