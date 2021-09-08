<template>
    <report-template
        :title="title"
        :period="period"
        :rows="rows" 
        :fields="fields"
        :columns="columns"
        :reportReady="reportReady"
        :onReportConfiguration="onPeriod"
        > 
    </report-template>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { PatientReportService } from "@/apps/ART/services/reports/patient_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate },
    data: () => ({
        title: 'Clinic Clients due for VL',
        totalClients: [],
        reportReady: false,
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
    created() {
        this.fields = this.getDateDurationFields()
    },
    methods: {
        async onPeriod(_: any, config: any) {
            this.reportReady = true
            this.report = new PatientReportService()
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
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
