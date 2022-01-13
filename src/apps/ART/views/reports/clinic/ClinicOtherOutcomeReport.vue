<template>
    <report-template
        :title="title"
        :period="period"
        :rows="rows" 
        :fields="fields"
        :columns="columns"
        :canExportCsv="false"
        :canExportPDf="false"
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
        rows: [] as any,
        columns: [] as any,
        outcome: '' as string,
    }),
    created() {
        const commonColumns = [
            [
                table.thTxt('ARV#'),
                table.thTxt('First name'),
                table.thTxt('Last name'), 
                table.thTxt('Birthdate'), 
                table.thTxt('Gender'), 
                table.thTxt('Outcome date'),
                table.thTxt('Actions')
            ]
        ]
        const buildCommonRow = (d: any) => ([
            table.td(d.identifier),
            table.td(d.given_name),
            table.td(d.family_name),
            table.tdDate(d.birthdate),
            table.td(d.gender),
            table.tdDate(d.start_date),
            table.tdBtn('View', () => this.$router.push({ path: `/patient/dashboard/${d.patient_id}`}))
        ])

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
                        value: 'Transfer Out',
                        other: {
                            columns: [
                                [
                                    table.thTxt('ARV#'),
                                    table.thTxt('First name'),
                                    table.thTxt('Last name'), 
                                    table.thTxt('Birthdate'), 
                                    table.thTxt('Gender'), 
                                    table.thTxt('Outcome date'),
                                    table.thTxt('TO Location'),
                                    table.thTxt('Actions')
                                ]
                            ],
                            rowBuilder: (d: any) => ([
                                table.td(d.identifier),
                                table.td(d.given_name),
                                table.td(d.family_name),
                                table.tdDate(d.birthdate),
                                table.td(d.gender),
                                table.tdDate(d.start_date),
                                table.td(d.transferred_out_to),
                                table.tdBtn('View', () => this.$router.push({ path: `/patient/dashboard/${d.patient_id}`}))

                            ])
                        }
                    },
                    {
                        label: 'Died',
                        value: 'Died',
                        other: {
                            columns: commonColumns,
                            rowBuilder: buildCommonRow
                        }
                    },
                    {
                        label: 'Stopped',
                        value: 'Stopped',
                        other: {
                            columns: commonColumns,
                            rowBuilder: buildCommonRow
                        }
                    }
                ]
            }
        ]
    },
    methods: {
        async onPeriod({outcome}: any, config: any) {
            this.rows = []
            this.columns = outcome.other.columns
            this.report = new PatientReportService()
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.outcome  = outcome.value.toString()
            this.title = `${this.outcome} Report`
            this.period = this.report.getDateIntervalPeriod()
            this.setRows(
                (await this.report.getOtherOutcome(this.outcome)),
                outcome.other.rowBuilder
            )
        },
        setRows(data: Array<any>, rowBuilder: Function) {
            if (data) data.forEach((d: any) => this.rows.push(rowBuilder(d)))
        }
    }
})
</script>
