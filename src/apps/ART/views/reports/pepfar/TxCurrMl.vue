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
import { TxReportService } from '@/apps/ART/services/reports/tx_report_service'
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import { IonPage } from "@ionic/vue"
import { AGE_GROUPS } from "@/apps/ART/services/reports/patient_report_service"

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
                table.thTxt('Died'),
                table.thTxt('IIT <3 mo'),
                table.thTxt('IIT 3-5 mo'),
                table.thTxt('IIT 6+ mo'),
                table.thTxt('Tranferred out'),
                table.thTxt('Refused (Stopped)')
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
        drilldown(patients: Array<number>, context: string) {
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
                        const drugs: any = d.drugs.map((drug: any) => {
                            const tableView = `
                                <table style='width: 100%;'> 
                                    <td style='width: 65%;'>${drug.name}</td>
                                    <td style='width: 30%;'>(${drug.quantity}, ${drug.dose} a day)</td>
                                </table>`
                            const dataView = `${drug.name} (Quantity: ${drug.quantity} Dose: ${drug.dose})`
                            return { tableView, dataView }
                        })
                        return [
                            table.td(d.id || 'N/A'),
                            table.tdDate(d.dob),
                            table.tdDate(d.dispenseDate),
                            table.td(drugs.map((d: any) => d.tableView).join('<p/>'), 
                            { 
                                value: drugs.map((d: any) => d.dataView).join('|')
                            })
                        ]
                    })
            }
            if (patients.length <= 0) {
                return table.td(0)
            }
            return table.tdLink(patients.length, () => this.drilldownData(context, columns, [], asyncRows))
        },
        async setRows(gender: string) {
            const contexts: any = [
                'Defaulted (new registration)',
                'Defaulted (old registration)',
                'Died',
                'Stopped',
                'Tranferred out',
                'Unknown'
            ]
            for(const i in AGE_GROUPS) {
                const group = AGE_GROUPS[i]
                try {
                    const cohortData = this.cohort[group][gender]
                    const drillContext = `${gender} ${group}`
                    const drillable = cohortData.map(
                        (d: Array<number>, i: number) => this.drilldown(d, `${drillContext} ${contexts[i]}`)
                    )
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
