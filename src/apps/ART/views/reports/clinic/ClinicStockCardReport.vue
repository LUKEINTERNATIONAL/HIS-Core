<template>
    <report-template
        :title="title"
        :rows="rows" 
        :columns="columns"
        > 
    </report-template>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { StockReportService } from "@/apps/ART/services/reports/stock_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import ReportTemplate from "@/apps/ART/views/reports/BasicReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate },
    data: () => ({
        title: 'HIV Stock report',
        rows: [] as Array<any>,
        stock: [] as Array<any>,
        columns: [
            [
                table.thTxt('Medication'), 
                table.thTxt('Earliest Expiry date'), 
                table.thTxt('Stock on hand(Tins)')
            ]
        ]
    }),
    async created() {
        this.report = new StockReportService()
        await this.report.loadStock()
        const stock  = this.report.groupStock()
        stock.forEach((s: any) => {
            this.rows.push([
                table.td(s.drugName),
                table.tdDate(s.expiryDate),
                table.td(s.currentQuantity)
            ])
        })
    }
})
</script>
