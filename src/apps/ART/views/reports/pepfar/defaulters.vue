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
import { DefaulterReportService } from "@/apps/ART/services/reports/pepfar/defaulters_report_service"
import ReportTable from "@/components/DataViews/tables/ReportDataTable.vue"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import ReportTemplate from "@/apps/ART/views/reports/pepfar/DefaultTemplate.vue"
import HisDate from "@/utils/Date"

export default defineComponent({
    components: { ReportTable, ReportTemplate },
    mixins: [ReportMixin],
    data: () => ({
        title: 'PEPFAR Defaulters report',
        totalClients: [],
        period: '',
        rows: [] as Array<any>,
        columns: [
            'ARV#',
            'First name',
            'Last name',
            'Gender',
            'birthdate',
            'Date defaulted',
            'Address'
        ]
    }),
    watch: {
        '$route': {
            async handler({query}: any){
                if(query && query.start && query.end) {
                    this.setPeriod(query.start, query.end)
                    await this.init(query.start, query.end)
                }
            },
            deep: true,
            immediate: true
        }
    },
    methods: {
        async init(startDate: string, endDate: string) {
            this.report = new DefaulterReportService(startDate, endDate)
            const data = await this.report.getDefaulters()
            this.setRows(data)
        },
        setPeriod(startDate: string, endDate: string) {
            this.period = `${HisDate.toStandardHisDisplayFormat(startDate)} - ${HisDate.toStandardHisDisplayFormat(endDate)}`
        },
        async setRows(data: Array<any>) {
            data.forEach((data: any) => {
                this.rows.push([
                    data.arv_number,
                    data.given_name,
                    data.family_name,
                    data.gender,
                    this.toDate(data.birthdate),
                    this.toDate(data.defaulter_date),
                    `${data.village} ${data.district} ${data.ta}`
                ])
            })
        }
    }
})
</script>
