<template>
    <report-template
        :title="title"
        :period="period"
        :rows="rows" 
        :fields="fields"
        :columns="columns"
        :reportReady="reportReady"
        :isLoading="isLoading"
        :onReportConfiguration="onPeriod"
        > 
    </report-template>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { PatientReportService } from "@/apps/ART/services/reports/patient_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate },
    data: () => ({
        title: 'Clinic Clients due for VL',
        totalClients: [],
        reportReady: false,
        rows: [] as Array<any>,
        isLoading: false as boolean,
        columns: [
            [
                table.thTxt('ARV#'),
                table.thTxt('App.'),
                table.thTxt('ART started'),
                table.thTxt('Months on ART'), 
                table.thTxt('Milestone'), 
                table.thTxt("Ordered"),
                table.thTxt("Result"), 
                table.thTxt("Released")
            ]
        ]
    }),
    created() {
        this.fields = this.getDateDurationFields()
    },
    methods: {
        async onPeriod(_: any, config: any) {
            this.reportReady = true
            this.isLoading = true
            this.report = new PatientReportService()
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            const data = await this.report.getClientsDueForVl()
            this.setRows(data)
            this.isLoading = false
        },
        async setRows(data: Array<any>) {
            data.forEach((d: any) => {
                this.rows.push([
                    table.td(d.arv_number),
                    table.tdDate(d.appointment_date),
                    table.tdDate(d.start_date),
                    table.td(d.months_on_art),
                    table.td(d.mile_stone),
                    table.tdDate(d.last_result_order_date),
                    table.td(d.last_result),
                    table.tdDate(d.last_result_date)
                ])
            })
        }
    }
})
</script>
