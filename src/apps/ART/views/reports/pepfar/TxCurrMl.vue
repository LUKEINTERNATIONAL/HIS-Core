<template>
    <report-template
        :title="title"
        :period="period"
        :totalClients="totalClients"
        > 
        <report-table :rows="rows" :columns="columns"> </report-table>
    </report-template>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { TxReportService, AGE_GROUPS } from '@/apps/ART/services/reports/tx_report_service'

export default defineComponent({
    mixins: [ReportMixin],
    data: () => ({
        title: 'PEPFAR Curr Ml Report',
        rows: [] as Array<any>,
        columns: [
            'Age group',
            'Gender',
            'Defaulted (new registration)',
            'Defaulted (old registration)',
            'Died',
            'Stopped',
            'Tranferred out',
            'Unknown'
        ],
        cohort: {} as any
    }),
    watch: {
        isReady: {
            async handler(y: boolean) {
                if (y) {
                    await this.init(this.startDate, this.endDate)
                }
            },
            immediate: true
        }
    },
    methods: {
        async init(startDate: string, endDate: string) {
            this.report = new TxReportService()
            this.report.setStartDate(startDate)
            this.report.setEndDate(endDate)
            this.cohort = await this.report.getTxMlReport()
            await this.setRows('F')
            await this.setRows('M')
        },
        async setRows(gender: string) {
            for(const i in AGE_GROUPS) {
                const group = AGE_GROUPS[i]
                try {
                    const cohortData = this.cohort[group][gender]
                    const drillable = cohortData.map((d: Array<number>) => this.buildDrillableLink(d))
                    this.rows.push([
                        group,
                        gender,
                        ...drillable
                    ])
                }catch(e) {
                    this.rows.push([group, gender, 0, 0, 0, 0, 0, 0])
                }
            }
        }
    }
})
</script>
