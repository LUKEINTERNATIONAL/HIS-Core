<template>
    <report-template
        :title="title"
        :period="period"
        :rows="rows" 
        :columns="columns"
        > 
    </report-template>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { PatientReportService } from "@/apps/ART/services/reports/patient_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate },
    data: () => ({
        title: 'Clinic Missed Appointments',
        totalClients: [],
        rows: [] as Array<any>,
        columns: [
           'ARV#','First name','Last name', 'Gender','DOB','Appointment','Days missed','Current outcome','Contact details'
        ]
    }),
    watch: {
        isReady: {
            async handler(y: boolean) {
                if (y) await this.init(this.startDate, this.endDate)
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        async init(startDate: string, endDate: string) {
            this.report = new PatientReportService()
            this.report.setStartDate(startDate)
            this.report.setEndDate(endDate)
            this.setRows((await this.report.getMissedAppointments()))
        },
        async setRows(data: Array<any>) {
            data.forEach((d: any) => {
               this.rows.push([
                    d.arv_number,
                    d.given_name,
                    d.family_name,
                    d.gender,
                    this.toDate(d.birthdate),
                    this.toDate(d.appointment_date),
                    d.days_missed,
                    d.current_outcome,
                    `CELL: ${d.cell_number} \
                     District: ${d.district} \
                     Village: ${d.village} \
                     TA: ${d.ta}
                    `
               ])
            })
        }
    }
})
</script>
