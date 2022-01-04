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
import { TxReportService, AGE_GROUPS } from '@/apps/ART/services/reports/tx_report_service'
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import { IonPage } from "@ionic/vue"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate, IonPage },
    data: () => ({
        title: 'PEPFAR Curr Ml Report',
        rows: [] as Array<any>,
        columns: [
            [
                table.thTxt('Age group'),
                table.thTxt('Gender'),
                table.thTxt('Defaulted (new registration)'),
                table.thTxt('Defaulted (old registration)'),
                table.thTxt('Died'),
                table.thTxt('Stopped'),
                table.thTxt('Tranferred out'),
                table.thTxt('Unknown')
            ]
        ],
        cohort: {} as any
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
            this.cohort = await this.report.getTxMlReport()
            await this.setRows('F')
            await this.setRows('M')
        },
        drilldown(patients: Array<number>) {
            const columns = [
                [
                    table.thTxt('ARV#'), 
                    table.thTxt('DOB'), 
                    table.thTxt('Dispensed'), 
                    table.thTxt('ARVs')
                ]
            ]
            const asyncRows = async () => {
                const data = await this.report.getTxMMDClientLevelData(patients)
                if (!data) { 
                    return []
                }
                return this.report
                    .remapTxClientLevelData(data)
                    .map((d: any) => {
                        const drugs: any = d.drugs.map((drug: any) => `
                            <table style='width: 100%;'> 
                                <td style='width: 65%;'>${drug.name}</td>
                                <td style='width: 30%;'>(${drug.quantity}, ${drug.dose} a day)</td>
                            </table>`)
                        return [
                            table.td(d.id || 'N/A'),
                            table.tdDate(d.dob),
                            table.tdDate(d.dispenseDate),
                            table.td(drugs.join('<p/>'))
                        ]
                    })
            }
            if (patients.length <= 0) {
                return table.td(0)
            }
            return table.tdLink(patients.length, () => this.drilldownData('Drill Table', columns, [], asyncRows))
        },
        async setRows(gender: string) {
            for(const i in AGE_GROUPS) {
                const group = AGE_GROUPS[i]
                try {
                    const cohortData = this.cohort[group][gender]
                    const drillable = cohortData.map((d: Array<number>) => this.drilldown(d))
                    this.rows.push([
                        table.td(group),
                        table.td(gender),
                        ...drillable
                    ])
                }catch(e) {
                    this.rows.push([
                        table.td(group), 
                        table.td(gender), 
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
