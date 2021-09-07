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
// import { DefaulterReportService } from "@/apps/ART/services/reports/defaulters_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"

export default defineComponent({
    mixins: [ReportMixin],
    data: () => ({
        title: '',
        totalClients: [],
        rows: [] as Array<any>,
        columns: [
        
        ]
    }),
    watch: {
        isReady: {
            async handler(y: boolean) {
                if (y) {
                    await this.init(this.startDate, this.endDate)
                }
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        async init(startDate: string, endDate: string) {
            // this.report = new DefaulterReportService()
            // this.report.setStartDate(startDate)
            // this.report.setEndDate(endDate)
            // const data = await this.report.getDefaulters()
            // this.setRows(data)
        },
        async setRows(data: Array<any>) {
            // TODO : create some rows
        }
    }
})
</script>
