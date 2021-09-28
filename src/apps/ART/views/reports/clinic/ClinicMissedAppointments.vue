<template>
    <report-template
        :title="title"
        :period="period"
        :rows="rows" 
        :fields="fields"
        :columns="columns"
        :canExportCsv="false"
        :canExportPDf="false"
        :isLoading="isLoading"
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
import table from "@/components/DataViews/tables/ReportDataTable"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate },
    data: () => ({
        title: 'Clinic Missed Appointments',
        totalClients: [],
        isLoading: false as boolean,
        rows: [] as Array<any>,
        reportReady: false as boolean,
        columns: [
            [
                table.thTxt('ARV#'),
                table.thTxt('First name'),
                table.thTxt('Last name'), 
                table.thTxt('Gender'),
                table.thTxt('DOB'),
                table.thTxt('Appointment'),
                table.thTxt('Days missed'),
                table.thTxt('Current outcome'),
                table.thTxt('Contact details')
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
            this.setRows((await this.report.getMissedAppointments()))
            this.isLoading = false
        },
        async setRows(data: Array<any>) {
            data.forEach((d: any) => {
               this.rows.push([
                    table.td(d.arv_number),
                    table.td(d.given_name),
                    table.td(d.family_name),
                    table.td(d.gender),
                    table.tdDate(d.birthdate),
                    table.tdDate(d.appointment_date),
                    table.td(d.days_missed),
                    table.td(d.current_outcome),
                    table.td(
                        `CELL: ${d.cell_number} \
                        District: ${d.district} \
                        Village: ${d.village} \
                        TA: ${d.ta}
                    `)
               ])
            })
        }
    }
})
</script>
