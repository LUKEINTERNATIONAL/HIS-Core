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

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate },
    data: () => ({
        title: 'HIV Stock report',
        rows: [] as Array<any>,
        stock: [] as Array<any>,
        columns: [
            'Medication', 'Earliest Expiry date', 'Stock on hand(Tins)'
        ]
    }),
    async created() {
        this.report = new StockReportService()
        await this.report.loadStock()
        const stock  = this.report.groupStock()
        console.log(stock)
        stock.forEach((s: any) => {
            this.rows.push([
                s.drugName,
                this.toDate(s.expiryDate),
                s.currentQuantity
            ])
        })
    }
})
</script>
