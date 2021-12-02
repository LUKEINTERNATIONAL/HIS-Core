<template>
    <ion-page> 
        <report-template
            :title="title"
            :period="period"
            :rows="rows" 
            :fields="fields"
            :columns="columns"
            reportPrefix="MoH"
            :onReportConfiguration="onPeriod"
            > 
        </report-template>
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { AGE_GROUPS } from "@/apps/ART/services/reports/patient_report_service"
import { RegimenReportService } from "@/apps/ART/services/reports/regimen_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { isEmpty } from 'lodash'
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import { IonPage } from "@ionic/vue"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate, IonPage },
    data: () => ({
        title: 'TPT new initiations report',
        rows: [] as Array<any>,
        cohort: {} as any,
        columns: [
            [
                table.thTxt('Age group'),
                table.thTxt('Gender'),
                table.thNum('3HP'),
                table.thNum('6H')
            ]
        ]
    }),
    created() {
        this.fields = this.getDateDurationFields()
    },
    methods: {
        async onPeriod(_: any, config: any) {
            this.rows = []
            this.report = new RegimenReportService()
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            this.cohort = await this.report.getTptNewInitiations()
            this.setRows('F')
            this.setRows('M')
        },
        drilldown(patients: Array<any>) {
            const columns = ['ARV #', 'DOB', 'Dispensed date']
            const onRows = () => patients.map((p: any) => [
                p.arv_number,
                this.toDate(p.birthdate),
                this.toDate(p.prescription_date)
            ])
            if (patients.length <= 0) {
                return table.td(0)
            }
            return table.tdLink(
                patients.length, 
                () => this.tableDrill({
                    columns, 
                    onRows 
                })
            )
        },
        setRows(gender: 'M' | 'F') {
            for(const ageIndex in AGE_GROUPS) {
                const group = AGE_GROUPS[ageIndex]
                if (!isEmpty(this.cohort) && group in this.cohort) {
                    const data = this.cohort[group]
                    this.rows.push([
                        table.td(group),
                        table.td(gender),
                        this.drilldown(data['3HP'][gender]),
                        this.drilldown(data['6H'][gender])
                    ])
                } else {
                    this.rows.push([
                        table.td(group),
                        table.td(gender),
                        table.td(0),
                        table.td(0)
                    ])
                }
            }
        }
    }
})
</script>
