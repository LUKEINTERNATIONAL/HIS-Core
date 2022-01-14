<template>
  <ion-page>
    <report-template
      :title="title"
      :period="period"
      :rows="rows"
      :fields="fields"
      :columns="columns"
      :showFilters="true"
      :onReportConfiguration="onPeriod"
    >
    </report-template>
  </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from "vue";
import {
  DataCleaningReportService,
  CtIndicator,
} from "@/apps/ART/services/reports/data_cleaning_report_service";
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue";
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue";
import table from "@/components/DataViews/tables/ReportDataTable";
import Validation from "@/components/Forms/validations/StandardValidations";
import { Option } from "@/components/Forms/FieldInterface";
import { FieldType } from "@/components/Forms/BaseFormElements";
import { IonPage } from "@ionic/vue";
import { NotFoundError, Service } from "@/services/service";
import { generateDateFields } from "@/utils/HisFormHelpers/MultiFieldDateHelper"
import { isEmpty } from "lodash"

export default defineComponent({
  mixins: [ReportMixin],
  components: { ReportTemplate, IonPage },
  data: () => ({
    title: "Data cleaning report",
    rows: [] as Array<any>,
    columns: [] as Array<any>
  }),
  created() {
    this.fields = [
        {
            id: "indicator",
            helpText: "Select indicator",
            type: FieldType.TT_SELECT,
            requireNext: false,
            validation: (val: Option) => Validation.required(val),
            options: () => this.getIndicatorOptions()
        },
        ...generateDateFields({
            id: 'start_date',
            helpText: 'Start',
            required: true,
            condition: (f: any) => !f.indicator.other.skipDateSelection,
            minDate: () => '2001-01-01',
            maxDate: () => Service.getSessionDate(),
            estimation: {
                allowUnknown: false
            },
            computeValue: (date: string) => date 
        }),
        ...generateDateFields({
            id: 'end_date',
            helpText: 'End',
            required: true,
            condition: (f: any) => !f.indicator.other.skipDateSelection,
            minDate: (_: any, c: any) => c.start_date,
            maxDate: () => Service.getSessionDate(),
            estimation: {
                allowUnknown: false
            },
            computeValue: (date: string) => date
        })
    ]
  },
  methods: {
    async onPeriod(form: any, config: any) {
      this.rows = []
      this.title = form.indicator.label
      const indicator = form.indicator
      this.columns = indicator.other.columns
      await indicator.other.setRows(form, config)
    },
    masterCardBtn(patientId: number) {
        return table.tdBtn("View", () =>
            this.$router.push(`/art/mastercard/${patientId}`)
        )
    },
    getDefaultIndicatorColumns(customHeaders=[] as Array<any>){
        return [
            [
                table.thTxt("ARV Number"),
                table.thTxt("Patient Id"),
                table.thTxt("First Name"),
                table.thTxt("Last Name"),
                table.thTxt("Gender"),
                table.thTxt("Date of birth"),
                ...customHeaders,
                table.thTxt("Action")
            ]
        ]
    },
    async setDefaultIndicatorRows(indicator: CtIndicator, startDate: string, endDate: string, getData=null as any) {
        this.report = new DataCleaningReportService()
        this.report.setStartDate(startDate)
        this.report.setEndDate(endDate)
        this.period = this.report.getDateIntervalPeriod()
        const data = await this.report.getCleaningToolReport(indicator)
        if (!isEmpty(data)) {
            data.forEach((d: any) => {
                const additionalData = typeof getData === 'function'
                    ? getData(d)
                    : []
                this.rows.push([
                    table.td(d.arv_number),
                    table.td(d.patient_id),
                    table.td(d.given_name),
                    table.td(d.family_name),
                    table.td(d.gender),
                    table.tdDate(d.birthdate),
                    ...additionalData,
                    this.masterCardBtn(d.patient_id)
                ])
            })
        }
    },
    getIndicatorOptions() {
        return [
            {
                label: "DOB > Date enrolled",
                value: CtIndicator.DobMoreThanEnrolledDate,
                other: {
                    skipDateSelection: false,
                    columns: this.getDefaultIndicatorColumns(),
                    setRows: (_: any, cf: any) => 
                        this.setDefaultIndicatorRows(
                            CtIndicator.DobMoreThanEnrolledDate, 
                            cf.start_date, 
                            cf.end_date
                        )
                }
            },
            {
                label: "Date enrolled < Earliest start date",
                value: CtIndicator.DateEnrolledLessThanEarliestStartDate,
                other: {
                    skipDateSelection: false,
                    columns: this.getDefaultIndicatorColumns([
                        table.thTxt('Earliest start date'),
                        table.thTxt('Date enrolled')
                    ]),
                    setRows: (_: any, cf: any) => 
                        this.setDefaultIndicatorRows(
                            CtIndicator.DateEnrolledLessThanEarliestStartDate, 
                            cf.start_date, 
                            cf.end_date,
                            (d: any) => [ 
                                table.tdDate(d.earliest_start_date),
                                table.tdDate(d.date_enrolled)
                            ] 
                        )
                }
            },
            {
                label: "Encounters after Death",
                value: CtIndicator.ClientsWithEncountersAfterDeath,
                other: {
                    skipDateSelection: false,
                    columns: this.getDefaultIndicatorColumns(),
                    setRows: (_: any, cf: any) => 
                        this.setDefaultIndicatorRows(
                            CtIndicator.ClientsWithEncountersAfterDeath, 
                            cf.start_date, cf.end_date
                        )
                }
            },
            {
                label: 'Incomplete visits',
                value: 'Incomplete visits',
                other: {
                    skipDateSelection: false,
                    columns: [
                        [
                            table.thTxt('ARV#'),
                            table.thTxt('NHID'),
                            table.thTxt('First name'),
                            table.thTxt('Last name'),
                            table.thTxt('Gender'),
                            table.thTxt('Birthdate'),
                            table.thTxt('Date(s)'),
                            table.thTxt('Action')
                        ]
                    ],
                    setRows: async (_: any, cf: any) => {
                        this.report = new DataCleaningReportService()
                        this.report.setStartDate(cf.start_date)
                        this.report.setEndDate(cf.end_date)
                        this.period = this.report.getDateIntervalPeriod()
                        const data = await this.report.getIncompleteVisits()
                        for(const pID in data) {
                            const d = data[pID] as any
                            this.rows.push([
                                table.td(d.arv_number),
                                table.td(d.national_id),
                                table.td(d.given_name),
                                table.td(d.family_name),
                                table.td(d.gender),
                                table.tdDate(d.birthdate),
                                table.td(d.dates.map((dt: any) => this.toDate(dt)).join('<br/>')),
                                this.masterCardBtn(parseInt(pID.toString()))
                            ])
                        }
                    }
                }
            },
            {
                label: "Enrolled on ART before birth",
                value: "Enrolled on ART before birth",
                other: {
                    skipDateSelection: true,
                    columns: [
                        [
                            table.thTxt('ARV number'),
                            table.thTxt('Name'),
                            table.thTxt('Earliest start date'),
                            table.thTxt('Date enrolled'),
                            table.thTxt('Gender'),
                            table.thTxt('Birth Date'),
                            table.thTxt('Action')
                        ]
                    ],
                    setRows: async () => {
                        try {
                            this.report = new DataCleaningReportService()
                            const data = await this.report.getEnrolledOnArtBeforeBirth()
                            data.forEach((d: any) => {
                                this.rows.push([
                                    table.td(d.identifier),
                                    table.td(d.name),
                                    table.tdDate(d.earliest_start_date),
                                    table.tdDate(d.date_enrolled),
                                    table.td(d.gender),
                                    table.tdDate(d.birthdate),
                                    this.masterCardBtn(d.patient_id)
                                ])
                            })
                        } catch (e) {
                            if (!(e instanceof NotFoundError)) {
                                throw e
                            }
                        }
                    }
                }
            },
            {
                label: "Male patients with female observations",
                value: CtIndicator.MalesWithFemaleObs,
                other: {
                    skipDateSelection: false,
                    columns: this.getDefaultIndicatorColumns([
                        table.thTxt('Visit date')
                    ]),
                    setRows: (_: any, cf: any) => 
                        this.setDefaultIndicatorRows(
                            CtIndicator.MalesWithFemaleObs, 
                            cf.start_date,
                            cf.end_date,
                            (p: any) => [
                                table.tdDate(p.visit_date)
                            ]
                        )
                }
            },
            {
                label: "Missing important demographics elements",
                value: CtIndicator.MissingDemographics,
                other: {
                    skipDateSelection: false,
                    columns: this.getDefaultIndicatorColumns(),
                    setRows: (_: any, cf: any) => 
                        this.setDefaultIndicatorRows(
                            CtIndicator.MissingDemographics, 
                            cf.start_date, 
                            cf.end_date
                        )
                }
            },
            {
                label: "Missing start reason",
                value: CtIndicator.MissingStartReasons,
                other: {
                    skipDateSelection: false,
                    columns: this.getDefaultIndicatorColumns(),
                    setRows: (_: string, cf: any) => 
                        this.setDefaultIndicatorRows(
                            CtIndicator.MissingStartReasons, 
                            cf.start_date, 
                            cf.end_date
                        )
                }
            },
            {
                label: "Multiple start reasons",
                value: CtIndicator.MultipleStartReasons,
                other: {
                    skipDateSelection: false,
                    columns: this.getDefaultIndicatorColumns(),
                    setRows: (_: string, cf: any) => 
                        this.setDefaultIndicatorRows(
                            CtIndicator.MultipleStartReasons, 
                            cf.start_date, 
                            cf.end_date
                        )
                }
            },
            {
                label: "Patients with Pre-ART / Unknown outcome",
                value: CtIndicator.PreArtOrUnknownOutcomes,
                other: {
                    skipDateSelection: false,
                    columns: this.getDefaultIndicatorColumns(),
                    setRows: (_: string, cf: any) =>
                        this.setDefaultIndicatorRows(
                            CtIndicator.PreArtOrUnknownOutcomes, 
                            cf.start_date, 
                            cf.end_date
                        )
                }
            },
            {
                label: "Prescriptions without dispensations",
                value: CtIndicator.PrescriptionWithoutDispensation,
                other: {
                    skipDateSelection: false,
                    columns: this.getDefaultIndicatorColumns([table.thTxt('Visit Date')]) ,
                    setRows: (_: string, cf: any) =>
                        this.setDefaultIndicatorRows(
                            CtIndicator.PrescriptionWithoutDispensation, 
                            cf.start_date, 
                            cf.end_date,
                            (patient: any) => [table.tdDate(patient.visit_date)]

                        )
                }
            }
        ]
    }
  }
})
</script>
