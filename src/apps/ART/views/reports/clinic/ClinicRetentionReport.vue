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
import { PatientReportService, OTHER_AGE_GROUPS } from "@/apps/ART/services/reports/patient_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { isEmpty } from 'lodash'
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate },
    data: () => ({
        title: 'Clinic Retention report',
        totalClients: [],
        rows: [] as Array<any>,
        reportReady: false as boolean,
        cohort: {} as any,
        isLoading: false as boolean,
        columns: [
            table.thTxt('Age group'),
            table.thTxt('Gender'),
            table.thTxt('Initiated one month'),
            table.thTxt('Completed one month'),
            table.thTxt('Initiated Three months'),
            table.thTxt('Completed Three months'),
            table.thTxt('Initiated Six months'),
            table.thTxt('Completed Six months')
        ]
    }),
    created() {
        this.fields = this.getDateDurationFields()
    },
    methods: {
        async onPeriod(_: any, config: any) {
            this.reportReady = true
            this.isLoading = true
            this.report = new PatientReportService()
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            this.cohort = await this.report.getClientRentention()
            this.setRows('F')
            this.setRows('M')
            this.isLoading = false
        },
        getValue(month: number, gender: 'M' | 'F', group: string, prop: 'all' | 'retained') {
            try {
                const data = this.cohort[month][prop]
                                 .filter((d: any) => d.gender === gender && d.age_group === group)
                                 .map((d: any) => d.patient_id)
                return this.drill(data)
            }catch(e) {
                console.warn(e)
                return 0
            }
        },
        setRows(gender: 'M' | 'F') {
            const ageGroups = [...OTHER_AGE_GROUPS, 'Unknown']
            for(const ageIndex in ageGroups) {
                const group = ageGroups[ageIndex]
                const row: any = [table.td(group), table.td(gender)]
                if (!isEmpty(this.cohort)) {
                    for (const month in this.cohort) {
                        row.push(this.getValue(parseInt(month), gender, group, 'all'))
                        row.push(this.getValue(parseInt(month), gender, group, 'retained'))
                    }
                    this.rows.push(row)
                } else {
                    this.rows.push([
                        ...row, 
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
