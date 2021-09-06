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
import { RegimenReportService } from "@/apps/ART/services/reports/pepfar/regimen_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"

export default defineComponent({
    mixins: [ReportMixin],
    data: () => ({
        title: 'PEPFAR Regimen Report',
        rows: [] as Array<any>,
        columns: [
            'ARV#',
            'Gender',
            'DOB',
            'Curr.Reg',
            'ARVs', 
            'Curr.reg dispensed'
        ]
    }),
    watch: {
        isReady: {
            async handler(y: boolean) {
                if (y) {
                    await this.init(this.startDate, this.endDate)
                }
            },
            immediate: true
        }
    },
    methods: {
        async init(startDate: string, endDate: string) {
            this.report = new RegimenReportService(startDate, endDate)
            const rowData = await this.report.getRegimenReport()
            this.setRows(rowData)
        },
        setRows(rowData: any) {
            this.rows = Object.values(rowData).map((data: any) => {
                let lastDispenseDate = ''
                const medications = data.medication.map((m: any) => {
                    lastDispenseDate = this.toDate(m.start_date)
                    return `${m.medication} (${m.quantity})`
                })
                return [
                    data.arv_number,
                    data.gender,
                    this.toDate(data.birthdate),
                    data.current_regimen,
                    medications.join(', '),
                    lastDispenseDate
                ]
            })
        }
    }
})
</script>
