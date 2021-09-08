<template>
    <report-template
        :title="title"
        :period="period"
        :rows="rows" 
        :columns="columns"> 
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
        totalClients: [],
        rows: [] as Array<any>,
        cohort: {} as any,
        columns: [
            'Age group',
            'Gender',
            '3HP',
            '6H'
        ]
    }),
    watch: {
        isReady: {
            async handler(y: boolean) {
                if (y) await this.init(this.startDate, this.endDate)
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        async init(startDate: string, endDate: string) {
            this.report = new RegimenReportService()
            this.report.setStartDate(startDate)
            this.report.setEndDate(endDate)
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
