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
import { NCD_TYPES, OpdReportService } from "@/apps/OPD/services/opd_report_service"
import ReportTemplate from "@/views/reports/BaseTableReport.vue"
import table, { ColumnInterface, RowInterface } from "@/components/DataViews/tables/ReportDataTable"
import ReportMixin from '@/apps/ART/views/reports/ReportMixin.vue'
import { isEmpty } from 'lodash'

export default defineComponent({
  components: { ReportTemplate },
  mixins: [ReportMixin],
  data: () => ({
    title: 'Cases seen report',
    rows: [] as RowInterface[][], 
    isLoading: false,
    reportReady: false,
    reportService: {} as any,
    prescriptions: {} as any,
    columns: [
      [
        table.thTxt('', {colspan: 2, style: {border: '.1rem solid white'}}),
        table.thTxt('New cases', {colspan: 2, style: {border: '.1rem solid white'}}),
        table.thTxt('All cases', {colspan: 2, style: {border: '.1rem solid white'}}),
      ],
      [
        table.thTxt('NCD type', {style: {textAlign: 'left', border: '.1rem solid white'}}),
        table.thTxt('Male', {style: {border: '.1rem solid white'}}),
        table.thTxt('Female', {style: {border: '.1rem solid white'}}),
        table.thTxt('Male', {style: {border: '.1rem solid white'}}),
        table.thTxt('Female', {style: {border: '.1rem solid white'}}),
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
      this.prescriptions = await this.reportService.getLaPrescriptions()
      this.rows = this.buildRows(this.prescriptions)
      
    },
    buildRows(data: Array<any>): RowInterface[][] {
      if(isEmpty(data)) return []
      return NCD_TYPES.map(type => ([
        table.td(type, {style: {textAlign: 'left'}}),
        table.td(''),
        table.td(''),
        table.td(''),
        table.td('')
      ]))
    },
  },
})
</script>
