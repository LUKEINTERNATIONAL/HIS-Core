<template>
    <clinic-report-template
        :title="title"
        :period="period"
        :totalClients="totalClients"
        > 
        <report-table :rows="rows" :columns="columns"> </report-table>
    </clinic-report-template>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { PatientReportService, OTHER_AGE_GROUPS } from "@/apps/ART/services/reports/patient_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { isEmpty } from 'lodash'

export default defineComponent({
    mixins: [ReportMixin],
    data: () => ({
        title: 'Clinic Retention report',
        totalClients: [],
        rows: [] as Array<any>,
        cohort: {} as any,
        columns: [
            'Age group',
            'Gender',
            'Initiated one month',
            'Completed one month',
            'Initiated Three months',
            'Completed Three months',
            'Initiated Six months',
            'Completed Six months'
        ]
    }),
    watch: {
        isReady: {
            async handler(y: boolean) {
                if (y) {
                    await this.init(this.startDate, this.endDate)
                }
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        async init(startDate: string, endDate: string) {
            this.report = new PatientReportService()
            this.report.setStartDate(startDate)
            this.report.setEndDate(endDate)
            this.cohort = await this.report.getClientRentention()
            this.setRows('F')
            this.setRows('M')
        },
        getValue(month: number, gender: 'M' | 'F', group: string, prop: 'all' | 'retained') {
            try {
                const data = this.cohort[month][prop]
                                 .filter((d: any) => d.gender === gender && d.age_group === group)
                                 .map((d: any) => d.patient_id)
                return this.buildDrillableLink(data)
            }catch(e) {
                console.warn(e)
                return 0
            }
        },
        setRows(gender: 'M' | 'F') {
            const ageGroups = [...OTHER_AGE_GROUPS, 'Unknown']
            for(const ageIndex in ageGroups) {
                const group = ageGroups[ageIndex]
                const row: any = [group, gender]
                if (!isEmpty(this.cohort)) {
                    for (const month in this.cohort) {
                        row.push(this.getValue(parseInt(month), gender, group, 'all'))
                        row.push(this.getValue(parseInt(month), gender, group, 'retained'))
                    }
                    this.rows.push(row)
                } else {
                    this.rows.push([...row, 0, 0, 0, 0, 0, 0 ])
                }
            }
        }
    }
})
</script>
