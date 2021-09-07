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
import { RegimenReportService } from "@/apps/ART/services/reports/regimen_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"

export default defineComponent({
    mixins: [ReportMixin],
    data: () => ({
        title: 'Regimen Formulation: Patient level report',
        totalClients: [],
        rows: [] as Array<any>,
        columns: [
            'ARV#', 'Gender', 'DOB'
        ]
    }),
    watch: {
        isReady: {
            async handler(y: boolean) {
                const { query } = this.$route
                if (y && query.regimen && query.formulation) {
                    await this.init(this.startDate, this.endDate, query.regimen, query.formulation)
                }
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        async init(startDate: string, endDate: string, regimen: any, formulation: any) {
            this.report = new RegimenReportService()
            this.report.setStartDate(startDate)
            this.report.setEndDate(endDate)
            this.setRows((await this.report.getRegimenFormulationReport(regimen, formulation)))
        },
        async setRows(data: Array<any>) {
            data.forEach((d: any) => {
               this.rows.push([
                    d.arv_number,
                    d.gender,
                    this.toDate(d.birthdate)
               ])
            })
        }
    }
})
</script>
