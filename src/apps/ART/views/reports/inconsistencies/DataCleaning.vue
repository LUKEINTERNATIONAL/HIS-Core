<template>
    <report-template
        :title="title"
        :period="period"
        :rows="rows" 
        :fields="fields"
        :columns="columns"
        :reportReady="reportReady"
        :isLoading="isLoading"
        :onReportConfiguration="onPeriod"
        > 
    </report-template>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { DataCleaningReportService, INDICATORS } from "@/apps/ART/services/reports/data_cleaning_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import Validation from "@/components/Forms/validations/StandardValidations"
import { Option } from "@/components/Forms/FieldInterface"
import { FieldType } from "@/components/Forms/BaseFormElements"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate },
    data: () => ({
        title: 'Data cleaning report',
        rows: [] as Array<any>,
        cohort: {} as any,
        reportReady: false as boolean,
        isLoading: false as boolean,
        columns: [
            table.thTxt('ARV Number'),
            table.thTxt('First Name'),
            table.thTxt('Last Name'),
            table.thTxt('Gender'),
            table.thTxt('Date of birth'),
            table.thTxt('Action')
        ]
    }),
    created() {
        this.fields.push({
            id: 'indicator',
            helpText: 'Select indicator',
            type: FieldType.TT_SELECT,
            validation: (val: Option) => Validation.required(val),
            options: () => INDICATORS.map((i: string) => ({ label: i, value: i}))
        })
        this.fields = this.fields.concat(this.getDateDurationFields())
    },
    methods: {
        async onPeriod(form: any, config: any) {
            this.reportReady = true
            this.isLoading = true
            this.title = form.indicator.value
            this.report = new DataCleaningReportService()
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            const data = await this.report.getCleaningToolReport(form.indicator.value)
            this.setRows(data)
            this.isLoading = false
        },
        async setRows(data: Array<any>) {
            data.forEach((data: any) => {
                this.rows.push([
                    table.td(data.arv_number),
                    table.td(data.given_name),
                    table.td(data.family_name),
                    table.td(data.gender),
                    table.tdDate(data.birthdate),
                    table.tdBtn('View', () => this.$router.push(`/patient/dashboard/${data.patient_id}`))
                ])
            })
        }
    }
})
</script>
