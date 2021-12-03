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
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { RegimenReportService, WEIGHT_BAND, REGIMENS } from "@/apps/ART/services/reports/regimen_report_service"
import { isEmpty } from "lodash"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import { IonPage } from "@ionic/vue"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate, IonPage },
    data: () => ({
        rows: [] as Array<any>,
        title: 'Regimen distribution (Weight)',
        columns: [
            [
                table.thTxt('Weight band'),
                table.thTxt('Gender'),
                table.thNum('0A'),
                table.thNum('2A'),
                table.thNum('4A'),
                table.thNum('5A'),
                table.thNum('6A'),
                table.thNum('7A'),
                table.thNum('8A'),
                table.thNum('9A'),
                table.thNum('10A'),
                table.thNum('11A'),
                table.thNum('12A'),
                table.thNum('13A'),
                table.thNum('14A'),
                table.thNum('15A'),
                table.thNum('16A'),
                table.thNum('17A'),
                table.thNum('0P'),
                table.thNum('2P'),
                table.thNum('4P'),
                table.thNum('9P'),
                table.thNum('11P'),
                table.thNum('14P'),
                table.thNum('14PP'),
                table.thNum('15P'),
                table.thNum('15PP'),
                table.thNum('16P'),
                table.thNum('17P'),
                table.thNum('Unknown'),
                table.thNum('Total (regimen)')
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
            const data = await this.report.getRegimensByWeight()
            await this.setRows(data)
        },
        async setRows(data: any) {
            const mapRegimenRow = (items: any) => 
                [...REGIMENS, 'N/A'].map((regimen: any) => {
                    const i = items.filter((d: any) => d[regimen] ? true : false)
                        .map((v: any) => Object.values(v)[0])
                    return table.td(isEmpty(i) ? 0 : i[0])
                })

            const rowTotals = (d: Array<any>) =>
                d.reduce((accum: number, curr: any) => accum + curr.td, 0)

            WEIGHT_BAND.forEach((weightBand: any) => {
                const weightBandData =  data.filter((d: any) => d.weight === weightBand)
                weightBandData.forEach((w: any) => {
                    const mRegimens = mapRegimenRow(w.males)
                    const fRegimens = mapRegimenRow(w.females)
                    const maleRow = [
                        table.td(weightBand), 
                        table.td('Male'), 
                        ...mRegimens, 
                        table.td(rowTotals(mRegimens))
                    ]
                    const femaleRow = [
                        table.td(weightBand),
                        table.td('Female'),
                        ...fRegimens,
                        table.td(rowTotals(fRegimens))
                    ]
                    this.rows.push(maleRow)
                    this.rows.push(femaleRow)
                    if (!isEmpty(w.unknown_gender)) {
                        const uRegimens = mapRegimenRow(w.unknown_gender)
                        const tCount = rowTotals(uRegimens)
                        this.rows.push([
                            table.td(weightBand),
                            table.td('Unknown Gender'),
                            ...uRegimens,
                            table.td(tCount)
                        ]) 
                    }
                })
            })
        }
    }
})
</script>
