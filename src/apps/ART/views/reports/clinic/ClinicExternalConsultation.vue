<template>
    <clinic-report-template
        :title="title"
        :period="period"
        :totalClients="totalClients"
        :rows="rows" :columns="columns"
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
        title: 'Clinic External consultation clients',
        totalClients: [],
        rows: [] as Array<any>,
        columns: [
            'ARV#','NPID', 'First name','Last name', 'Gender','DOB','Date set'
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
            this.setRows((await this.report.getExternalConsultationClients()))
        },
        async setRows(data: Array<any>) {
            data.forEach((d: any) => {
                this.rows.push([
                    d.arv_number,
                    d.npid,
                    d.given_name,
                    d.family_name,
                    d.gender,
                    this.toDate(d.birthdate),
                    this.toDate(d.date_set)
                ])
            })
        }
    }
})
</script>
