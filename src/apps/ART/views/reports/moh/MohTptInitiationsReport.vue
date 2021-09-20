<template>
    <report-template
        :title="title"
        :period="period"
        :rows="rows" 
        :fields="fields"
        :columns="columns"
        :reportReady="reportReady"
        :isLoading="isLoading"
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
import table from "@/components/DataViews/tables/ReportDataTable"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate },
    data: () => ({
        title: 'MoH TPT new initiations report',
        rows: [] as Array<any>,
        cohort: {} as any,
        reportReady: false as boolean,
        isLoading: false as boolean,
        columns: [
            table.thTxt('Age group'),
            table.thTxt('Gender'),
            table.thNum('3HP'),
            table.thNum('6H')
        ]
    }),
    created() {
        this.fields = this.getDateDurationFields()
    },
    methods: {
        async onPeriod(_: any, config: any) {
            this.reportReady = true
            this.isLoading = true
            this.report = new RegimenReportService()
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            this.cohort = await this.report.getTptNewInitiations()
            this.setRows('F')
            this.setRows('M')
            this.isLoading = false
        },
        setRows(gender: 'M' | 'F') {
            for(const ageIndex in AGE_GROUPS) {
                const group = AGE_GROUPS[ageIndex]
                if (!isEmpty(this.cohort) && group in this.cohort) {
                    const data = this.cohort[group]
                    this.rows.push([
                        table.td(group),
                        table.td(gender),
                        this.drill(data['3HP'][gender]),
                        this.drill(data['6H'][gender])
                    ])
                } else {
                    this.rows.push([
                        table.td(group),
                        table.td(gender),
                        table.td(0),
                        table.td(0)
                    ])
                }
            }
        }
    }
})
</script>
