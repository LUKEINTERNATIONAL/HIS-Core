<template>
    <ion-page>
        <report-template
            :title="title"
            :period="period"
            :rows="rows" 
            :fields="fields"
            :columns="columns"
            :showtitleOnly="true"
            :canExportPDf="false"
            :onReportConfiguration="onPeriod"
            > 
        </report-template>
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { PatientReportService } from "@/apps/ART/services/reports/patient_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import { IonPage } from "@ionic/vue"
import ART_GLOBAL_PROP from "@/apps/ART/art_global_props" 

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate, IonPage },
    data: () => ({
        title: 'Clinic Clients due for VL <small>(clients with appointments in specified period)</small>',
        rows: [] as Array<any>,
        columns: [] as Array<any>
    }),
    async created() {
        const isFn = await ART_GLOBAL_PROP.filingNumbersEnabled()
        this.columns.push([
            table.thTxt(isFn ? 'Filing #' : 'ARV#'),
            table.thTxt('App.'),
            table.thTxt('ART started'),
            table.thTxt('Months on ART'), 
            table.thTxt('Milestone'), 
            table.thTxt("Ordered"),
            table.thTxt("Result"), 
            table.thTxt("Released")
        ])
        this.fields = this.getDateDurationFields()
    },
    methods: {
        async onPeriod(_: any, config: any) {
            this.rows = []
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
                    table.tdLink(d.arv_number, () => this.confirmPatient(d.patient_id)),
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
