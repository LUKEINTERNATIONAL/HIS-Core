<template>
  <report-template v-if="rows"
    :title="title"
    :rows="rows"
    :fields="fields"
    :columns="columns"
    :period="period"
    :reportReady="reportReady"
    :isLoading="isLoading"
    :onReportConfiguration="init"
  ></report-template>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { OpdReportService } from "@/apps/OPD/services/opd_report_service"
import ReportTemplate from "@/views/reports/BaseTableReport.vue"
import table, { ColumnInterface, RowInterface } from "@/components/DataViews/tables/ReportDataTable"
import ReportMixin from '@/apps/ART/views/reports/ReportMixin.vue'
import { isEmpty } from 'lodash'

export default defineComponent({
  components: { ReportTemplate },
  mixins: [ReportMixin],
  data: () => ({
    title: 'OPD Diagnosis',
    rows: [] as RowInterface[][], 
    isLoading: false,
    reportReady: false,
    reportService: {} as any,
    columns: [
      [
        table.thTxt('', {colspan: 2, style: {border: '.1rem solid white'}}),
        table.thTxt('<6 months', {colspan: 2, style: {border: '.1rem solid white'}}),
        table.thTxt('6 months < 5 yrs', {colspan: 2, style: {border: '.1rem solid white'}}),
        table.thTxt('5 months < 14 yrs', {colspan: 2, style: {border: '.1rem solid white'}}),
        table.thTxt('> 14 yrs', {colspan: 2, style: {border: '.1rem solid white'}}),
        table.thTxt('Unknown', {colspan: 2, style: {border: '.1rem solid white'}}),
        table.thTxt(''),
      ],
      [
        table.thTxt('Diagnosis', {style: {textAlign: 'left', border: '.1rem solid white'}}),
        table.thTxt('F', {style: {border: '.1rem solid white'}}),
        table.thTxt('M', {style: {border: '.1rem solid white'}}),
        table.thTxt('F', {style: {border: '.1rem solid white'}}),
        table.thTxt('M', {style: {border: '.1rem solid white'}}),
        table.thTxt('F', {style: {border: '.1rem solid white'}}),
        table.thTxt('M', {style: {border: '.1rem solid white'}}),
        table.thTxt('F', {style: {border: '.1rem solid white'}}),
        table.thTxt('M', {style: {border: '.1rem solid white'}}),
        table.thTxt('F', {style: {border: '.1rem solid white'}}),
        table.thTxt('M', {style: {border: '.1rem solid white'}}),
        table.thTxt('Total', {style: {border: '.1rem solid white'}}),
      ]
    ] as ColumnInterface[][],
  }),
  created(){
    this.fields = this.getDateDurationFields()
  },
  methods: {
    async init(_: any, config: any){
      this.reportReady = true
      this.isLoading = true
      this.reportService = new OpdReportService()
      this.reportService.setStartDate(config.start_date)
      this.reportService.setEndDate(config.end_date)
      this.period = this.reportService.getDateIntervalPeriod()
      this.rows = this.buildRows((await this.reportService.getDiagnosis()))
      
    },
    totalDiagnosis(diagnosis: Record<string, number>) {
      return Object.values(diagnosis).reduce((a, b) => a + b, 0)
    },
    buildRows(data: Record<string, any>): RowInterface[][] {
      if(isEmpty(data)) return []
      return Object.keys(data).map(key => ([
        table.td(key, {style: {textAlign: 'left'}}),
        table.td(data[key].female_less_than_six_months),
        table.td(data[key].male_less_than_six_months),
        table.td(data[key].female_six_months_to_less_than_five_yrs),
        table.td(data[key].male_six_months_to_less_than_five_yrs),
        table.td(data[key].female_five_yrs_to_fourteen_years),
        table.td(data[key].male_five_yrs_to_fourteen_years),
        table.td(data[key].female_over_fourteen_years),
        table.td(data[key].male_over_fourteen_years),
        table.td(data[key].female_unknowns),
        table.td(data[key].male_unknowns),
        table.td(this.totalDiagnosis(data[key])),
      ]))
    },
  },
})
</script>
