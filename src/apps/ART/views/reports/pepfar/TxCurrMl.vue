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
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { TxReportService, AGE_GROUPS } from '@/apps/ART/services/reports/tx_report_service'
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate },
    data: () => ({
        title: 'PEPFAR Curr Ml Report',
        rows: [] as Array<any>,
        reportReady: false as boolean,
        isLoading: false as boolean,
        columns: [
            [
                table.thTxt('Age group'),
                table.thTxt('Gender'),
                table.thTxt('Defaulted (new registration)'),
                table.thTxt('Defaulted (old registration)'),
                table.thTxt('Died'),
                table.thTxt('Stopped'),
                table.thTxt('Tranferred out'),
                table.thTxt('Unknown')
            ]
        ],
        cohort: {} as any
    }),
    created() {
        this.fields = this.getDateDurationFields()
    },
    methods: {
        async onPeriod(_: any, config: any) {
            this.reportReady = true
            this.isLoading = true
            this.rows = []
            this.report = new TxReportService()
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            this.cohort = await this.report.getTxMlReport()
            await this.setRows('F')
            await this.setRows('M')
            this.isLoading = false
        },
        async setRows(gender: string) {
            for(const i in AGE_GROUPS) {
                const group = AGE_GROUPS[i]
                try {
                    const cohortData = this.cohort[group][gender]
                    const drillable = cohortData.map((d: Array<number>) => this.drill(d))
                    this.rows.push([
                        table.td(group),
                        table.td(gender),
                        ...drillable
                    ])
                }catch(e) {
                    this.rows.push([
                        table.td(group), 
                        table.td(gender), 
                        table.td(0), 
                        table.td(0), 
                        table.td(0), 
                        table.td(0), 
                        table.td(0), 
                        table.td(0) 
                    ])
                }
            }
        }
    }
})
</script>
