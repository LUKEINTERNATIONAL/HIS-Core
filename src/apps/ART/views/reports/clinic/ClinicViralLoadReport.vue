<template>
    <ion-page> 
        <report-template
            :title="title"
            :period="period"
            :rows="rows" 
            :fields="fields"
            :columns="columns"
            :canExportPDf="false"
            :showtitleOnly="true"
            :onReportConfiguration="onPeriod"
            > 
        </report-template>
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { PatientReportService } from "@/apps/ART/services/reports/patient_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import { FieldType } from '@/components/Forms/BaseFormElements'
import Validation from "@/components/Forms/validations/StandardValidations"
import { Option } from '@/components/Forms/FieldInterface'
import table from "@/components/DataViews/tables/ReportDataTable"
import { IonPage } from "@ionic/vue"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate, IonPage },
    data: () => ({
        title: '',
        totalClients: [],
        rows: [] as Array<any>,
        reportReady: false as boolean,
        isLoading: false as boolean,
        columns: [
            [
                table.thTxt('ARV#'), 
                table.thTxt('Gender'), 
                table.thTxt('Birthdate'), 
                table.thTxt('Specimen'), 
                table.thTxt('Ordered'), 
                table.thTxt('Result'), 
                table.thTxt('Released')
            ]
        ]
    }),
    created() {
        this.fields = [
            ...this.getDateDurationFields(),
            {
                id: 'result_type',
                helpText: 'Select result type',
                type: FieldType.TT_SELECT,
                validation: (val: Option) => Validation.required(val),
                options: () => [
                    {
                        label: 'Viraemia 1000+',
                        value: 'viraemia-1000'
                    },
                    {
                        label: 'Suppressed',
                        value: 'suppressed'
                    },
                    {
                        label: 'Low level viraemia',
                        value: 'low-level-viraemia'
                    }
                ]
            }
        ]
    },
    methods: {
        async onPeriod(form: any, config: any) {
            const resultType = form.result_type
            this.rows = []
            this.report = new PatientReportService()
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            this.title = `${resultType.label} Report <small><b>(between the period of (${this.period})</b></small>`
            this.setRows((await this.report.getViralLoadResults(resultType.value.toLowerCase())))
        },
        async setRows(data: Array<any>) {
            data.forEach((d: any) => {
               this.rows.push([
                    table.td(d.arv_number),
                    table.td(d.gender),
                    table.tdDate(d.birthdate),
                    table.td(d.specimen),
                    table.tdDate(d.order_date),
                    table.td(d.result),
                    table.tdDate(d.result)                    
               ])
            })
        }
    }
})
</script>
