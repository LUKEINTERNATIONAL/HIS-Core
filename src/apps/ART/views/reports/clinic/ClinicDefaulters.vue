<template>
    <ion-page>
        <report-template
            :title="title"
            :period="period"
            :rows="rows" 
            :fields="fields"
            :columns="columns"
            :canExportCsv="false"
            :canExportPDf="false"
            :showtitleOnly="true"
            :onReportConfiguration="onPeriod"
            > 
        </report-template>
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { DefaulterReportService } from "@/apps/ART/services/reports/defaulters_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import { IonPage } from "@ionic/vue"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate, IonPage },
    data: () => ({
        title: 'Clinic Defaulters report',
        rows: [] as Array<any>,
        columns: [
            [
                table.thTxt('ARV#'),
                table.thTxt('First name'),
                table.thTxt('Last name'),
                table.thTxt('Gender'),
                table.thTxt('birthdate'),
                table.thTxt('Date defaulted'),
                table.thTxt('Address')
            ]
        ]
    }),
    created() {
        this.fields = this.getDateDurationFields()
    },
    methods: {
        async onPeriod(_: any, config: any) {
            this.rows = []
            this.report = new DefaulterReportService()
            this.report.setIsPepfar(false)
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            const data = await this.report.getDefaulters()
            this.setRows(data)
            this.title = `Clinic Defaulters report <b>(${data.length} Defaulters)</b>`
        },
        async setRows(data: Array<any>) {
            data.forEach((data: any) => {
                this.rows.push([
                    table.td(data.arv_number),
                    table.td(data.given_name),
                    table.td(data.family_name),
                    table.td(data.gender),
                    table.tdDate(data.birthdate),
                    table.tdDate(data.defaulter_date),
                    table.td(
                        (data.cell_number ? `CELL: ${data.cell_number} <br/>`: '') +
                        (data.village ? `VILLAGE: ${data.village} <br/>` : '') +
                        (data.district ? `DISTRICT: ${data.district} <br/>`: '') +
                        (data.ta ? `TA: ${data.ta}`: '')
                    )
                ])
            })
        }
    }
})
</script>
