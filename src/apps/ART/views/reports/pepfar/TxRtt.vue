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
import { TxReportService, AGE_GROUPS } from '@/apps/ART/services/reports/pepfar/tx_report_service'

export default defineComponent({
    mixins: [ReportMixin],
    data: () => ({
        Title: 'PEPFAR TX RTT Report',
        cohort: {} as any,
        rows: [] as Array<any>,
        columns: [
            'Age group',
            'Gender',
            'Returned after 30+ days'
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
            this.report = new TxReportService(startDate, endDate)
            this.cohort = await this.report.getTxRttReport()
            await this.setRows()
        },
        async setRows() {
            const femaleRows = await this.buildRows('F')
            const maleRows = await this.buildRows('M')
            this.rows = femaleRows.concat(maleRows)
        },
        async buildRows(gender: string) {
            const rows = []
            for(const i in AGE_GROUPS) {
                const group = AGE_GROUPS[i]

                if (group in this.cohort) {
                    const cohortData = this.cohort[group][gender]
    
                    rows.push([
                        group,
                        gender,
                        this.buildDrillableLink(cohortData)
                    ])
                } else {
                    rows.push([group, gender, 0])
                }
            }
            return rows
        }
    }
})
</script>
