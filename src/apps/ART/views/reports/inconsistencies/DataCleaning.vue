<template>
    <ion-page>
        <report-template
            :title="title"
            :period="period"
            :rows="rows" 
            :fields="fields"
            :columns="columns"
            :onReportConfiguration="onPeriod"
            > 
        </report-template>
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { DataCleaningReportService, CtIndicator } from "@/apps/ART/services/reports/data_cleaning_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import Validation from "@/components/Forms/validations/StandardValidations"
import { Option } from "@/components/Forms/FieldInterface"
import { FieldType } from "@/components/Forms/BaseFormElements"
import { IonPage } from "@ionic/vue"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate, IonPage },
    data: () => ({
        title: 'Data cleaning report',
        rows: [] as Array<any>,
        cohort: {} as any,
        columns: [
            [
                table.thTxt('ARV Number'),
                table.thTxt('First Name'),
                table.thTxt('Last Name'),
                table.thTxt('Gender'),
                table.thTxt('Date of birth'),
                table.thTxt('Action')
            ]
        ]
    }),
    created() {
        this.fields.push({
            id: 'indicator',
            helpText: 'Select indicator',
            type: FieldType.TT_SELECT,
            validation: (val: Option) => Validation.required(val),
            options: () => {
                return [
                    {
                        label: 'DOB > Date enrolled',
                        value: CtIndicator.DobMoreThanEnrolledDate
                    },
                    {
                        label: 'Date enrolled < Earliest start date',
                        value: CtIndicator.DateEnrolledLessThanEarliestStartDate
                    },
                    {
                        label: 'Encounters after Death',
                        value: CtIndicator.ClientsWithEncountersAfterDeath
                    },
                    {
                        label: 'Enrolled on ART before birth',
                        value: CtIndicator.DobMoreThanDateEnrolled
                    }, 
                    {
                        label: 'Male patients with female observations',
                        value: CtIndicator.MalesWithFemaleObs
                    },
                    {
                        label: 'Missing important demographics elements',
                        value: CtIndicator.MissingDemographics
                    },
                    {
                        label: 'Missing start reason',
                        value: CtIndicator.MissingStartReasons
                    },
                    {
                        label: 'Multiple start reasons',
                        value: CtIndicator.MultipleStartReasons
                    },
                    {
                        label: 'Patients with Pre-ART / Unknown outcome',
                        value: CtIndicator.PreArtOrUnknownOutcomes
                    }
                ]
            }
        })
        this.fields = this.fields.concat(this.getDateDurationFields())
    },
    methods: {
        async onPeriod(form: any, config: any) {
            this.rows = []
            this.title = form.indicator.value
            this.report = new DataCleaningReportService()
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            const data = await this.report.getCleaningToolReport(form.indicator.value)
            this.setRows(data)
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
