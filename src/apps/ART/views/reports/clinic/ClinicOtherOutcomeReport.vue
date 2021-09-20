<template>
    <report-template
        :title="title"
        :period="period"
        :rows="rows" 
        :fields="fields"
        :columns="columns"
        :canExportCsv="false"
        :canExportPDf="false"
        :reportReady="reportReady"
        :isLoading="isLoading"
        :onReportConfiguration="onPeriod"
        > 
    </report-template>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { PatientReportService } from "@/apps/ART/services/reports/patient_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import { FieldType } from '@/components/Forms/BaseFormElements'
import { Option } from '@/components/Forms/FieldInterface'
import Validation from "@/components/Forms/validations/StandardValidations"
import table from "@/components/DataViews/tables/ReportDataTable"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate },
    data: () => ({
        title: '',
        totalClients: [],
        rows: [] as Array<any>,
        outcome: '' as string,
        isLoading: false as boolean,
        columns: [
            table.thTxt('ARV#'),
            table.thTxt('First name'),
            table.thTxt('Last name'), 
            table.thTxt('Birthdate'), 
            table.thTxt('Gender'), 
            table.thTxt('Outcome date')
        ]
    }),
    created() {
        this.fields = [
            ...this.getDateDurationFields(),
            {
                id: 'outcome',
                helpText: 'Select outcome',
                type: FieldType.TT_SELECT,
                validation: (val: Option) => Validation.required(val),
                options: () => [
                    {
                        label: 'Transfer Out',
                        value: 'Transfer Out'
                    },
                    {
                        label: 'Died',
                        value: 'Died'
                    },
                    {
                        label: 'Stopped',
                        value: 'Stopped'
                    }
                ]
            }
        ]
    },
    methods: {
        async onPeriod({outcome}: any, config: any) {
            this.reportReady = true
            this.isLoading = true
            this.report = new PatientReportService()
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.outcome  = outcome.value.toString()
            this.title = `${this.outcome} Report`
            this.period = this.report.getDateIntervalPeriod()
            this.setRows((await this.report.getOtherOutcome(this.outcome)))
            this.isLoading = false
        },
        async setRows(data: Array<any>) {
            const isTransferOut = this.outcome.match(/trans/i)
            if (isTransferOut) {
                this.columns.push(table.thTxt('TO Location'))
            }
            this.columns.push(table.thTxt('Action'))
            data.forEach((d: any) => {
               const row = []
               row.push(table.td(d.identifier))
               row.push(table.td(d.given_name))
               row.push(table.td(d.family_name))
               row.push(table.tdDate(d.birthdate))
               row.push(d.gender)
               row.push(table.tdDate(d.start_date))
               if (isTransferOut) {
                   row.push(table.td(d.transferred_out_to))
               } 
               row.push(table.tdBtn('View', () => {
                   this.$router.push({ path: `/patient/dashboard/${d.patient_id}`})
               }))
               this.rows.push(row)
            })
        }
    }
})
</script>
