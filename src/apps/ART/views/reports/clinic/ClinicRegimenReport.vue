<template>
    <clinic-report-template
        :title="title"
        :period="period"
        :totalClients="totalClients"
        :rows="rows" :columns="columns"
        > 
        <report-table :rows="rows" :columns="columns"> </report-table>
    </clinic-report-template>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { RegimenReportService } from "@/apps/ART/services/reports/regimen_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"

export default defineComponent({
    mixins: [ReportMixin],
    data: () => ({
        title: 'Clinic Regimen Report',
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
                if (y) await this.init(this.startDate, this.endDate)
            },
            immediate: true
        }
    },
    methods: {
        async init(startDate: string, endDate: string) {
            this.report = new RegimenReportService()
            this.report.setReportType('moh')
            this.report.setStartDate(startDate)
            this.report.setEndDate(endDate)
            this.setRows((await this.report.getRegimenReport()))
        },
        setRows(data: any) {
            Object.values(data).map((d: any) => {
                let lastDispenseDate = ''
                const medications = d.medication.map((m: any) => {
                    lastDispenseDate = this.toDate(m.start_date)
                    return `${m.medication} (${m.quantity})`
                })
                this.rows.push([
                    d.arv_number,
                    d.gender,
                    this.toDate(d.birthdate),
                    d.current_regimen,
                    medications.join(', '),
                    lastDispenseDate
                ])
            })
        }
    }
})
</script>
