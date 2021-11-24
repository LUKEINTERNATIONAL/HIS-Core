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
import { MENTAL_HEALTH_DIAGNOSIS, OpdReportService } from "@/apps/OPD/services/opd_report_service"
import ReportTemplate from "@/views/reports/BaseTableReport.vue"
import table, { ColumnInterface, RowInterface } from "@/components/DataViews/tables/ReportDataTable"
import ReportMixin from '@/apps/ART/views/reports/ReportMixin.vue'
import { isEmpty } from 'lodash'

export default defineComponent({
  components: { ReportTemplate },
  mixins: [ReportMixin],
  data: () => ({
    title: 'Mental health report',
    rows: [] as RowInterface[][], 
    isLoading: false,
    reportReady: false,
    reportService: {} as any,
    prescriptions: {} as any,
    columns: [
      [
        table.thTxt('', {colspan: 2, style: {border: '.1rem solid white'}}),
        table.thTxt('New cases', {colspan: 4, style: {border: '.1rem solid white'}}),
        table.thTxt('Subsequent cases', {colspan: 4, style: {border: '.1rem solid white'}}),
      ],
      [
        table.thTxt('Diagnosis', {style: {textAlign: 'left', border: '.1rem solid white'}}),
        table.thTxt('M (0-15 years)', {style: {border: '.1rem solid white'}}),
        table.thTxt('M (>=16 years)', {style: {border: '.1rem solid white'}}),
        table.thTxt('F (0-15 years)', {style: {border: '.1rem solid white'}}),
        table.thTxt('F (>=16 years)', {style: {border: '.1rem solid white'}}),
        table.thTxt('M (0-15 years)', {style: {border: '.1rem solid white'}}),
        table.thTxt('M (>=16 years)', {style: {border: '.1rem solid white'}}),
        table.thTxt('F (0-15 years)', {style: {border: '.1rem solid white'}}),
        table.thTxt('F (>=16 years)', {style: {border: '.1rem solid white'}}),
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
      this.prescriptions = await this.reportService.getLaPrescriptions() // TODO: implement function to fetch mental health report data from API
      this.rows = this.buildRows(this.prescriptions)
      
    },
    buildRows(data: Array<any>): RowInterface[][] {
      if(isEmpty(data)) return []
      return MENTAL_HEALTH_DIAGNOSIS.map( diagnosis => ([
        table.td(diagnosis, {style: {textAlign: 'left'}}),
        table.td(''),
        table.td(''),
        table.td(''),
        table.td(''),
        table.td(''),
        table.td(''),
        table.td(''),
        table.td(''),
      ]))
    },
  },
})
</script>
