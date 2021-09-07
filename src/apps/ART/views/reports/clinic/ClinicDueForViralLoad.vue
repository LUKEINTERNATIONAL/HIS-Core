<template>
    <clinic-report-template
        :title="title"
        :period="period"
        :totalClients="totalClients"
        > 
        <report-table :rows="rows" :columns="columns"> </report-table>
    </clinic-report-template>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { PatientReportService } from "@/apps/ART/services/reports/patient_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"

export default defineComponent({
    mixins: [ReportMixin],
    data: () => ({
        title: 'Clinic Clients due for VL',
        totalClients: [],
        rows: [] as Array<any>,
        columns: [
            'ARV#',
            'App.',
            'ART started',
            'Months on ART', 
            'Milestone', 
            "Ordered",
            "Result", 
            "Released"
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
            this.report = new PatientReportService()
            this.report.setStartDate(startDate)
            this.report.setEndDate(endDate)
            const data = await this.report.getClientsDueForVl()
            this.setRows(data)
        },
        async setRows(data: Array<any>) {
            data.forEach((d: any) => {
                this.rows.push([
                    d.arv_number,
                    d.appointment_date,
                    this.toDate(d.start_date),
                    d.months_on_art,
                    d.mile_stone,
                    this.toDate(d.last_result_order_date),
                    d.last_result,
                    this.toDate(d.last_result_date)
                ])
            })
        }
    }
})
</script>
