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
import { TbPrevReportService, AGE_GROUPS } from '@/apps/ART/services/reports/tb_prev_report_service'
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate },
    data: () => ({
        title: 'PEPFAR TB PREV Report',
        cohort: {} as any,
        rows: [] as Array<any>,
        reportReady: false as boolean,
        columns: [
            'Age group',
            'Gender',
            '3HP',
            '6HP',
            '3HP',
            '6HP',
            '3HP',
            '6HP',
            '3HP',
            '6HP'
        ]
    }),
    created() {
        this.fields = this.getDateDurationFields()
    },
    methods: {
        async onPeriod(_: any, config: any) {
            this.reportReady = true
            this.report = new TbPrevReportService()
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.cohort = await this.report.getTBPrevReport()
            this.setRows('F')
            this.setRows('M')
        },
        makeDrilldown(data: Array<any>) {
            const values = data.map(p => p.patient_id)
            return this.buildDrillableLink(values)
        },
        async setRows(gender: string) {
            for(const i in AGE_GROUPS) {
                const group = AGE_GROUPS[i]
                const cohortData = this.cohort[group][gender]
                this.rows.push([
                    group,
                    gender,
                    this.makeDrilldown(cohortData['3HP']['started_new_on_art']),
                    this.makeDrilldown(cohortData['6H']['started_new_on_art']),
                    this.makeDrilldown(cohortData['3HP']['started_previously_on_art']),
                    this.makeDrilldown(cohortData['6H']['started_previously_on_art']),
                    this.makeDrilldown(cohortData['3HP']['completed_new_on_art']),
                    this.makeDrilldown(cohortData['6H']['completed_new_on_art']),
                    this.makeDrilldown(cohortData['3HP']['completed_previously_on_art']),
                    this.makeDrilldown(cohortData['6H']['completed_previously_on_art'])
                ])
            }
        }
    }
})
</script>
