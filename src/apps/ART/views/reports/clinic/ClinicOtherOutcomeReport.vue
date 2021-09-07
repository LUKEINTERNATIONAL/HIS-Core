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
        title: '',
        totalClients: [],
        rows: [] as Array<any>,
        outcome: '' as string,
        columns: [
            'ARV#','First name','Last name', 'birthdate', 'Gender', 'Outcome date'
        ]
    }),
    watch: {
        isReady: {
            async handler(y: boolean) {
                const { query } = this.$route
                if (y && query.outcome) {
                    await this.init(this.startDate, this.endDate, query.outcome)
                }
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        async init(startDate: string, endDate: string, outcome: any) {
            this.report = new PatientReportService()
            this.report.setStartDate(startDate)
            this.report.setEndDate(endDate)
            this.outcome  = outcome.toString()
            this.title = `${outcome} Report`
            this.setRows((await this.report.getOtherOutcome(this.outcome)))
        },
        async setRows(data: Array<any>) {
            const isTransferOut = this.outcome.match(/trans/i)
            if (isTransferOut) {
                this.columns.push('Location')
            }
            data.forEach((d: any) => {
               const row = [
                    d.identifier,
                    d.given_name,
                    d.family_name,
                    this.toDate(d.birthdate),
                    d.gender,
                    this.toDate(d.start_date)
               ]
               if (isTransferOut) {
                   row.push(d.transferred_out_to)
               }
               this.rows.push(row)
            })
        }
    }
})
</script>
