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
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { TxReportService, AGE_GROUPS } from '@/apps/ART/services/reports/tx_report_service'
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate },
    data: () => ({
        title: 'PEPFAR TX RTT Report',
        cohort: {} as any,
        rows: [] as Array<any>,
        reportReady: false as boolean,
        columns: [
            'Age group',
            'Gender',
            'Returned after 30+ days'
        ]
    }),
    created() {
        this.fields = this.getDateDurationFields()
    },
    methods: {
        async onPeriod(_: any, config: any) {
            this.reportReady = true
            this.report = new TxReportService()
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            this.cohort = await this.report.getTxRttReport()
            await this.setRows('F')
            await this.setRows('M')
        },
        async setRows(gender: string) {
            for(const i in AGE_GROUPS) {
                const group = AGE_GROUPS[i]
                if (group in this.cohort) {
                    const cohortData = this.cohort[group][gender]
                    this.rows.push([
                        group,
                        gender,
                        this.buildDrillableLink(cohortData)
                    ])
                } else {
                    this.rows.push([group, gender, 0])
                }
            }
        }
    }
})
</script>
