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
import { RegimenReportService } from "@/apps/ART/services/reports/regimen_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate },
    data: () => ({
        title: 'Clinic Regimen Report',
        rows: [] as Array<any>,
        reportReady: false as boolean,
        isLoading: false as boolean,
        columns: [
            [
                table.thTxt('ARV#'),
                table.thTxt('Gender'),
                table.thTxt('DOB'),
                table.thTxt('Curr.Reg'),
                table.thTxt('ARVs'), 
                table.thTxt('Curr.reg dispensed')
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
            this.rows = []
            this.report = new RegimenReportService()
            this.report.setReportType('moh')
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            this.setRows((await this.report.getRegimenReport()))
            this.isLoading = false
        },
        setRows(data: any) {
            Object.values(data).map((d: any) => {
                let lastDispenseDate = ''
                const medications = d.medication.map((m: any) => {
                    lastDispenseDate = this.toDate(m.start_date)
                    return `${m.medication} (${m.quantity})`
                })
                this.rows.push([
                    table.td(d.arv_number),
                    table.td(d.gender),
                    table.tdDate(d.birthdate),
                    table.td(d.current_regimen),
                    table.td(medications.join(', ')),
                    table.tdDate(lastDispenseDate)
                ])
            })
        }
    }
})
</script>
