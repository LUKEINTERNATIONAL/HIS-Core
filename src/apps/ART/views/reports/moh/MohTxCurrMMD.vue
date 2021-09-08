<template>
    <report-template
        :title="title"
        :period="period"
        :rows="rows" 
        :columns="columns"
        > 
    </report-template>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { TxReportService, OTHER_AGE_GROUPS } from '@/apps/ART/services/reports/tx_report_service'
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate },
    data: () => ({
        title: 'Moh TX CURR MMD Report',
        cohort: {} as any,
        rows: [] as Array<any>,
        columns:  [
            'Age group',
            'Gender',
            '# of clients on < 3 months of ARVs',
            '# of clients on 3 - 5 months of ARVs',
            '# of clients on  >= 6 months of ARVs'
        ]
    }),
    watch: {
        isReady: {
            async handler(y: boolean) {
                if (y) await this.init(this.startDate, this.endDate)
            },
            immediate: true
        }
    },
    methods: {
        async init(startDate: string, endDate: string) {
            this.report = new TxReportService()
            this.report.setOrg('moh')
            this.report.setStartDate(startDate)
            this.report.setEndDate(endDate)
            await this.setRows()
        },
        getValues(patients: Record<string, Array<any>>) {
            const underThreeMonths: Array<any> = []
            const betweenThreeAndFiveMonths: Array<any> = []
            const overSixMonths: Array<any> = []

            for (const patientId in patients) {
                const data: any = patients[patientId]
                const pDays = data.prescribed_days

                if(pDays < 90) {
                    underThreeMonths.push(patientId)
                }

                if (pDays >= 90 && pDays <= 150) {
                    betweenThreeAndFiveMonths.push(patientId)
                }

                if (pDays > 150) {
                    overSixMonths.push(patientId)
                }
            }
            return [
                this.buildDrillableLink(underThreeMonths),
                this.buildDrillableLink(betweenThreeAndFiveMonths),
                this.buildDrillableLink(overSixMonths)
            ]
        },
        async setRows() {
            let minAge = 0
            let maxAge = 0
            const males = []
            const females = []

            for(const i in OTHER_AGE_GROUPS) {
                const group = OTHER_AGE_GROUPS[i]
                if (group === '<1 year') {
                    minAge = 0
                    maxAge = 0
                } else if (group === '50 plus years') {
                    minAge = 50
                    maxAge = 120
                } else {
                    const [min, max] = group.split('-')
                    minAge = parseInt(min)
                    maxAge = parseInt(max)
                }
                const res = await this.report.getTxCurrMMDReport(minAge, maxAge)
                if (res) {
                    females.push([
                        group,
                        'Female',
                        ...this.getValues(res['Female'])
                    ])
                    males.push([
                        group,
                        'Male',
                        ...this.getValues(res['Male'])
                    ])
                } else {
                    females.push([group, 'Female', 0, 0, 0])
                    males.push([group, 'Male', 0, 0, 0])
                }
                this.rows = [...females, ...males]
            }
        }
    }
})
</script>
