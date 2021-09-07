<template>
    <report-template
        :title="title"
        :period="period"
        :totalClients="totalClients"
        > 
        <report-table :rows="rows" :columns="columns"> </report-table>
    </report-template>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { TbPrevReportService, AGE_GROUPS } from '@/apps/ART/services/reports/tb_prev_report_service'

export default defineComponent({
    mixins: [ReportMixin],
    data: () => ({
        title: 'PEPFAR TB PREV Report',
        cohort: {} as any,
        rows: [] as Array<any>,
        columns: [
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
    }),
    watch: {
        isReady: {
            async handler(y: boolean) {
                if (y) {
                    await this.init(this.startDate, this.endDate)
                }
            },
            immediate: true
        }
    },
    methods: {
        async init(startDate: string, endDate: string) {
            this.report = new TbPrevReportService()
            this.report.setStartDate(startDate)
            this.report.setEndDate(endDate)
            this.cohort = await this.report.getTBPrevReport()
            await this.setRows()
        },
        makeDrilldown(data: Array<any>) {
            const values = data.map(p => p.patient_id)
            return this.buildDrillableLink(values)
        },
        async setRows() {
            const femaleRows = await this.buildRows('F')
            const maleRows = await this.buildRows('M')
            this.rows = femaleRows.concat(maleRows)
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
        }
    }
})
</script>
