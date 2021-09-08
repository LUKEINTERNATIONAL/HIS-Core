<template>
    <report-template
        :title="title"
        :period="period"
        :rows="rows" 
        :columns="columns"
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
        title: 'Clinic Pregnant patients report',
        totalClients: [],
        rows: [] as Array<any>,
        columns: [
            'ARV#','First name','Last name', 'birthdate'
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
            this.setRows((await this.report.getPregnantWomen()))
        },
        async setRows(data: Array<any>) {
            data.forEach((d: any) => {
               this.rows.push([
                    d.arv_number,
                    d.given_name,
                    d.family_name,
                    this.toDate(d.birthdate)
               ])
            })
        }
    }
})
</script>
