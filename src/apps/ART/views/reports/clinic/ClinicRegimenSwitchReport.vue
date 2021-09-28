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
        title: 'Clinic Regimen Switch Report', 
        rows: [] as Array<any>,
        reportReady: false as boolean,
        isLoading: false as boolean,
        columns:  [
            [
                table.thTxt('ARV#'),
                table.thTxt('Patient type'),
                table.thTxt('Gender'),
                table.thTxt('DOB'),
                table.thTxt('Prev.Reg'),
                table.thTxt('Curr.Reg'),
                table.thTxt('ARVs'), 
                table.thTxt('Curr.reg dispensed date')
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
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            this.setRows(await this.report.getRegimenSwitchReport())
            this.isLoading = false
        },
        async setRows(data: any) {
            Object.values(data).map((d: any) => {
                let lastDispenseDate = ''
                const medications = d.medication.map((m: any) => {
                    lastDispenseDate = m.start_date
                    return `${m.medication} (${m.quantity})`
                })
                return [
                    table.td(d.arv_number),
                    table.td(d.patient_type),
                    table.td(d.gender),
                    table.tdDate(d.birthdate),
                    table.td(d.previous_regimen),
                    table.td(d.current_regimen),
                    table.td(medications.join(', ')),
                    table.tdDate(lastDispenseDate)
                ]
            })
        }
    }
})
</script>
