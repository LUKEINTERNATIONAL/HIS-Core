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
import { RegimenReportService } from "@/apps/ART/services/reports/regimen_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import { REGIMENS, FORMULATIONS } from "@/apps/ART/services/reports/regimen_report_service"
import Validation from "@/components/Forms/validations/StandardValidations"
import { FieldType } from '@/components/Forms/BaseFormElements'
import { Option } from '@/components/Forms/FieldInterface'
import table from "@/components/DataViews/tables/ReportDataTable"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate },
    data: () => ({
        title: 'Regimen Formulation: Patient level report',
        totalClients: [],
        rows: [] as Array<any>,
        isLoading: false as boolean,
        reportReady: false as boolean,
        columns: [
            [
                table.thTxt('ARV#'), 
                table.thTxt('Gender'), 
                table.thTxt('DOB')
            ]
        ]
    }),
    created() {
        this.fields = [
            ...this.getDateDurationFields(),
            {
                id: 'regimen',
                helpText: 'Select regimen',
                type: FieldType.TT_SELECT,
                validation: (val: Option) => Validation.required(val),
                options: () => REGIMENS.map((r: string) => ({ label: r, value: r }))
            },
            {
                id: 'formulation',
                helpText: 'Select formulation',
                type: FieldType.TT_SELECT,
                validation: (val: Option) => Validation.required(val),
                options: () => FORMULATIONS.map((f: string) => ({ label: f, value: f }))
            }
        ]
    },
    methods: {
        async onPeriod({regimen, formulation}: any, config: any) {
            this.reportReady = true
            this.isLoading = true
            this.rows = []
            this.report = new RegimenReportService()
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            this.setRows((await this.report.getRegimenFormulationReport(regimen.value, formulation.value)))
            this.isLoading = false
        },
        async setRows(data: Array<any>) {
            data.forEach((d: any) => {
               this.rows.push([
                    table.td(d.arv_number),
                    table.td(d.gender),
                    table.tdDate(d.birthdate)
               ])
            })
        }
    }
})
</script>
