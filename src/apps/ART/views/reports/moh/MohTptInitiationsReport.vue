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
import { AGE_GROUPS } from "@/apps/ART/services/reports/patient_report_service"
import { RegimenReportService } from "@/apps/ART/services/reports/regimen_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { isEmpty } from 'lodash'
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate },
    data: () => ({
        title: 'MoH TPT new initiations report',
        rows: [] as Array<any>,
        cohort: {} as any,
        reportReady: false as boolean,
        columns: [
            'Age group',
            'Gender',
            '3HP',
            '6H'
        ]
    }),
    created() {
        this.fields = this.getDateDurationFields()
    },
    methods: {
        async onPeriod(_: any, config: any) {
            this.reportReady = true
            this.report = new RegimenReportService()
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.cohort = await this.report.getTptNewInitiations()
            this.setRows('F')
            this.setRows('M')
        },
        setRows(gender: 'M' | 'F') {
            for(const ageIndex in AGE_GROUPS) {
                const group = AGE_GROUPS[ageIndex]
                if (!isEmpty(this.cohort) && group in this.cohort) {
                    const data = this.cohort[group]
                    this.rows.push([
                        group, 
                        gender, 
                        this.buildDrillableLink(data['3HP'][gender]), 
                        this.buildDrillableLink(data['6H'][gender])
                    ])
                } else {
                    this.rows.push([group, gender, 0, 0])
                }
            }
        }
    }
})
</script>
