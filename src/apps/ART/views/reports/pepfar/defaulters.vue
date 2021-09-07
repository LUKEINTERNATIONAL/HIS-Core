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
import { DefaulterReportService } from "@/apps/ART/services/reports/defaulters_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"

export default defineComponent({
    mixins: [ReportMixin],
    data: () => ({
        title: 'PEPFAR Defaulters report',
        totalClients: [],
        rows: [] as Array<any>,
        columns: [
            'ARV#',
            'First name',
            'Last name',
            'Gender',
            'birthdate',
            'Date defaulted',
            'Address'
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
            this.report = new DefaulterReportService()
            this.report.setStartDate(startDate)
            this.report.setEndDate(endDate)
            const data = await this.report.getDefaulters()
            this.setRows(data)
        },
        async setRows(data: Array<any>) {
            data.forEach((data: any) => {
                this.rows.push([
                    data.arv_number,
                    data.given_name,
                    data.family_name,
                    data.gender,
                    this.toDate(data.birthdate),
                    this.toDate(data.defaulter_date),
                    `${data.village} ${data.district} ${data.ta}`
                ])
            })
        }
    }
})
</script>
