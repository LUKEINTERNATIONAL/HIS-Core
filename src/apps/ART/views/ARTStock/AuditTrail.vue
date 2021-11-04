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
        title: 'Audit trail',
        rows: [] as Array<any>,
        stock: [] as Array<any>,
        columns: [
            [
                table.thTxt('Medication'), 
                table.thTxt('Transaction date'), 
                table.thTxt('Transaction type'),
                table.thTxt('Quantity'),
                table.thTxt('Username'),
                table.thTxt('reason')
            ]
        ]
    }),
    async created() {
        this.report = new StockReportService()
        const stock = await this.report.loadTrail()
        stock.forEach((s: any) => {
            this.rows.push([
                table.td(s.drug_name),
                table.tdDate(s.transaction_date),
                table.td(s.transaction_type),
                table.td(s.amount_committed_to_stock),
                table.td(s.username),
                table.td(s.transaction_reason),
            ])
        })
    }
})
</script>
