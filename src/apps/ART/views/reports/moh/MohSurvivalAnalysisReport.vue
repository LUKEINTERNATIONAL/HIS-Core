<template>
    <report-template
        :title="title"
        :period="period"
        :totalClients="totalClients"
        :rows="rows" 
        :columns="columns"> 
        <report-table :rows="rows" :columns="columns"> </report-table>
    </report-template>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { SurvivalAnalysisReportService } from "@/apps/ART/services/reports/survival_analysis_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { isEmpty } from 'lodash'

export default defineComponent({
    mixins: [ReportMixin],
    data: () => ({
        title: 'ART survival analysis report',
        totalClients: [],
        rows: [] as Array<any>,
        columns: [
            'Reg cohort',
            'Interval (months)',
            'Sub group',
            'Total Reg (database)',
            'Alive',
            'Died',
            'Defaulted',
            'Stopped',
            'TO',
            'Unknown'
        ]
    }),
    watch: {
        '$route': {
            async handler({ query }: any) {
                if (query.quarter) this.init(query.quarter.toString())
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        async init(quarter: string) {
            this.report = new SurvivalAnalysisReportService()
            this.report.setQuarter(quarter)
            this.setRows((await this.report.getSurvivalAnalysis()))
        },
        setRows(quarterList: any) {
            for(const quarterIndex in quarterList) {
                const quarterOutcomes = quarterList[quarterIndex]
                let totalRegInQuarter = 0
                let qInterval = 0
                const outcomeRef: any = {
                    'On antiretrovirals': 0,
                    'Defaulted': 0,
                    'Patient died': 0,
                    'Patient transferred out': 0,
                    'Treatment stopped': 0,
                    'unknown': 0
                }

                if (isEmpty(quarterOutcomes)) continue

                for(const outcome in quarterOutcomes) {
                    const outcomeIntervals =  quarterOutcomes[outcome] 
                    for (const interval in outcomeIntervals) {
                        qInterval = parseInt(interval)
                        const count = outcomeIntervals[interval]
                        totalRegInQuarter += count
                        if (outcome in outcomeRef) {
                            outcomeRef[outcome] += count
                        } else {
                            outcomeRef['unknown'] += count
                        }
                    }
                }
                this.rows.push([
                    quarterIndex,
                    qInterval,
                    this.report.getAgeGroup(),
                    totalRegInQuarter,
                    outcomeRef['On antiretrovirals'],
                    outcomeRef['Patient died'],
                    outcomeRef['Defaulted'],
                    outcomeRef['Treatment stopped'],
                    outcomeRef['Patient transferred out'],
                    outcomeRef['unknown']
                ])
            }
        }
    }
})
</script>
