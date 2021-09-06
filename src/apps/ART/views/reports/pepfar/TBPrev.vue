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
import { TbPrevReportService, AGE_GROUPS } from '@/apps/ART/services/reports/pepfar/tb_prev_report_service'

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
            this.report = new TbPrevReportService(startDate, endDate)
        },
        getColumns() {
            return  [
                '#',
                'Age group',
                'Gender',
                '3HP',
                '6HP',
                '3HP',
                '6HP',
                '3HP',
                '6HP',
                '3HP',
                '6HP'
            ]
        },
        makeDrilldown(data: Array<any>) {
            const values = data.map(p => p.patient_id)
            return this.buildDrillableLink(values)
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
                const cohortData = this.cohort[group][gender]
                rows.push([
                    counter,
                    group,
                    gender,
                    this.makeDrilldown(cohortData['3HP']['started_new_on_art']),
                    this.makeDrilldown(cohortData['6H']['started_new_on_art']),
                    this.makeDrilldown(cohortData['3HP']['started_previously_on_art']),
                    this.makeDrilldown(cohortData['6H']['started_previously_on_art']),
                    this.makeDrilldown(cohortData['3HP']['completed_new_on_art']),
                    this.makeDrilldown(cohortData['6H']['completed_new_on_art']),
                    this.makeDrilldown(cohortData['3HP']['completed_previously_on_art']),
                    this.makeDrilldown(cohortData['6H']['completed_previously_on_art'])
                ])
                ++counter
            }
            return rows
        },
        getFields(): Array<Field> {
            return [
                ...this.getDateDurationFields(),
                {
                    id: 'report',
                    helpText: 'TB Prev report',
                    type: FieldType.TT_TABLE_VIEWER,
                    options: async (_: any, c: any) => {
                       this.init(c.start_date, c.end_date)
                       const data = await this.report.getTBPrevReport()
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
