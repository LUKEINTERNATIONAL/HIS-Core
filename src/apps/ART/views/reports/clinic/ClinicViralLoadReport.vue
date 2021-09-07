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
        columns: [
            'ARV#', 'Gender', 'Birthdate', 'Specimen', 'Ordered', 'Result', 'Released'
        ]
    }),
    watch: {
        isReady: {
            async handler(y: boolean) {
                const { query } = this.$route
                if (y && query.result_type) {
                    await this.init(this.startDate, this.endDate, {
                        label: query.result_title,
                        value: query.result_type
                    })
                }
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        async init(startDate: string, endDate: string, resultType: any) {
            this.report = new PatientReportService()
            this.report.setStartDate(startDate)
            this.report.setEndDate(endDate)
            this.title = `${resultType.label} Report`
            this.setRows((await this.report.getViralLoadResults(resultType.value.toLowerCase())))
        },
        async setRows(data: Array<any>) {
            data.forEach((d: any) => {
               this.rows.push([
                    d.arv_number,
                    d.gender,
                    this.toDate(d.birthdate),
                    d.specimen,
                    this.toDate(d.order_date),
                    d.result,
                    this.toDate(d.result)                    
               ])
            })
        }
    }
})
</script>
