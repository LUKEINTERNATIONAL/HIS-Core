<template>
    <report-template
        :title="title"
        :period="period"
        :totalClients="totalClients"
        :rows="rows" :columns="columns"
        > 
        <report-table :rows="rows" :columns="columns"> </report-table>
    </report-template>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { TxReportService, AGE_GROUPS } from '@/apps/ART/services/reports/tx_report_service'

export default defineComponent({
    mixins: [ReportMixin],
    data: () => ({
        title: 'PEPFAR TX RTT Report',
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
                if (y) await this.init(this.startDate, this.endDate)
            },
            immediate: true
        }
    },
    methods: {
        async init(startDate: string, endDate: string) {
            this.report = new TxReportService()
            this.report.setStartDate(startDate)
            this.report.setEndDate(endDate)
            this.cohort = await this.report.getTxRttReport()
            await this.setRows('F')
            await this.setRows('M')
        },
        async setRows(gender: string) {
            for(const i in AGE_GROUPS) {
                const group = AGE_GROUPS[i]
                if (group in this.cohort) {
                    const cohortData = this.cohort[group][gender]
                    this.rows.push([
                        group,
                        gender,
                        this.buildDrillableLink(cohortData)
                    ])
                } else {
                    this.rows.push([group, gender, 0])
                }
            }
        }
    }
})
</script>
