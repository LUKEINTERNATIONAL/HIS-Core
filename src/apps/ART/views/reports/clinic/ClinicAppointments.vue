<template>
    <report-template
        :title="title"
        :period="period"
        :rows="rows" 
        :fields="fields"
        :columns="columns"
        :reportReady="reportReady"
        :canExportCsv="false"
        :canExportPDf="false"
        :onReportConfiguration="onPeriod"> 
    </report-template>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { PatientReportService } from "@/apps/ART/services/reports/patient_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import { FieldType } from '@/components/Forms/BaseFormElements'
import Validation from "@/components/Forms/validations/StandardValidations"
import HisDate from "@/utils/Date"
import table from "@/components/DataViews/tables/ReportDataTable"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate },
    data: () => ({
        title: 'Appointments',
        date: '' as string,
        rows: [] as Array<any>,
        appointments: [] as any,
        reportReady: false as boolean,
        columns: [
            [
                table.thTxt('ARV#'),
                table.thTxt('First name'),
                table.thTxt('Last name'),
                table.thTxt('Gender'),
                table.thTxt('birthdate'),
                table.thTxt('Current Address')
            ]
        ]
    }),
    created() {
        this.report = new PatientReportService()
        this.fields = [
            {
                id: 'date',
                helpText: 'Select date',
                type: FieldType.TT_APPOINTMENT_PICKER,
                validation: (val: any) => Validation.required(val),
                onValue: async (date: string, context: any) => {
                    const data = await this.report.getBookedAppointments(date)
                    if (data.length > 0) {
                        this.appointments = data
                        context.appointmentCounter = this.appointments.length
                        return true
                    }
                    return false
                }
            }
        ]
    },
    methods: {
        async onPeriod(form: any) {
            this.reportReady = true
            this.rows = []
            this.period = HisDate.toStandardHisDisplayFormat(form.date)
            this.setRows(this.appointments)
        },
        async setRows(data: Array<any>) {
            data.forEach((data: any) => {
                this.rows.push([
                    table.td(data.arv_number || 'N/A'),
                    table.td(data.given_name),
                    table.td(data.family_name),
                    table.td(data.gender),
                    table.tdDate(data.birthdate),
                    table.td(
                       `District: ${data.district}
                        table.td( Village: ${data.village}
                        table.td( Land-mark: ${data.land_mark}`
                    )
                ])
            })
        }
    }
})
</script>
