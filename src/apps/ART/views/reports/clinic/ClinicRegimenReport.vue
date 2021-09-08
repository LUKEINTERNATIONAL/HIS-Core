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
import { RegimenReportService } from "@/apps/ART/services/reports/regimen_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate },
    data: () => ({
        title: 'Clinic Regimen Report',
        rows: [] as Array<any>,
        reportReady: false as boolean,
        columns: [
            'ARV#',
            'Gender',
            'DOB',
            'Curr.Reg',
            'ARVs', 
            'Curr.reg dispensed'
        ]
    }),
    created() {
        this.fields = this.getDateDurationFields()
    },
    methods: {
        async onPeriod(_: any, config: any) {
            this.reportReady = true
            this.report = new RegimenReportService()
            this.report.setReportType('moh')
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.setRows((await this.report.getRegimenReport()))
        },
        setRows(data: any) {
            Object.values(data).map((d: any) => {
                let lastDispenseDate = ''
                const medications = d.medication.map((m: any) => {
                    lastDispenseDate = this.toDate(m.start_date)
                    return `${m.medication} (${m.quantity})`
                })
                this.rows.push([
                    d.arv_number,
                    d.gender,
                    this.toDate(d.birthdate),
                    d.current_regimen,
                    medications.join(', '),
                    lastDispenseDate
                ])
            })
        }
    }
})
</script>
