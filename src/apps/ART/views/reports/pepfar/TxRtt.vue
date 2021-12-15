<template>
    <ion-page>
        <report-template
            :title="title"
            :period="period"
            :rows="rows" 
            :fields="fields"
            :columns="columns"
            reportPrefix="PEPFAR"
            :onReportConfiguration="onPeriod"
            > 
        </report-template>
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { TxReportService } from '@/apps/ART/services/reports/tx_report_service'
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import { AGE_GROUPS } from "@/apps/ART/services/reports/patient_report_service"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate },
    data: () => ({
        title: 'TX RTT Report',
        cohort: {} as any,
        rows: [] as Array<any>,
        columns: [
            [       
                table.thTxt('Age group'),
                table.thTxt('Gender'),
                table.thTxt('Returned <3 mo'),
                table.thTxt('Returned 3-5 mo'),
                table.thTxt('Returned 6+ mo')
            ]
        ]
    }),
    created() {
        this.fields = this.getDateDurationFields()
    },
    methods: {
        async onPeriod(_: any, config: any) {
            this.rows = []
            this.report = new TxReportService()
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            this.cohort = await this.report.getTxRttReport()
            await this.setRows('F')
            await this.setRows('M')
        },
        async setRows(gender: string) {
            const sortData = (ls: Array<any>, comparator: Function) => {
                return ls.filter(i => comparator(i.months))
                    .map(i => i.patient_id)
            }
            for(const i in AGE_GROUPS) {
                const group = AGE_GROUPS[i]
                if (group in this.cohort) {
                    const cohortData = this.cohort[group][gender]
                    const s = (comparator: Function) => sortData(cohortData, comparator)
                    const lessThanThreeMonths = s((months: number) => months < 3)
                    const threeToFiveMonths = s((months: number) => months >= 3 && months <= 5)
                    const sixPlusMonths = s((months: number) => months >= 6)
                    this.rows.push([
                        table.td(group),
                        table.td(gender),
                        this.drill(lessThanThreeMonths),
                        this.drill(threeToFiveMonths),
                        this.drill(sixPlusMonths)
                    ])
                } else {
                    this.rows.push([
                        table.td(group),
                        table.td(gender),
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
