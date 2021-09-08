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
import { DefaulterReportService } from "@/apps/ART/services/reports/defaulters_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate },
    data: () => ({
        title: 'PEPFAR Defaulters report',
        rows: [] as Array<any>,
        reportReady: false as boolean,
        columns: [
            'ARV#',
            'First name',
            'Last name',
            'Gender',
            'birthdate',
            'Date defaulted',
            'Address'
        ]
    }),
    created() {
        this.fields = this.getDateDurationFields()
    },
    methods: {
        async onPeriod(_: any, config: any) {
            this.reportReady = true
            this.report = new DefaulterReportService()
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            const data = await this.report.getDefaulters()
            this.setRows(data)
        },
        async setRows(data: Array<any>) {
            data.forEach((data: any) => {
                this.rows.push([
                    data.arv_number,
                    data.given_name,
                    data.family_name,
                    data.gender,
                    this.toDate(data.birthdate),
                    this.toDate(data.defaulter_date),
                    `${data.village} ${data.district} ${data.ta}`
                ])
            })
        }
    }
})
</script>
