<template>
  <report-template
    :title="title"
    :rows="rows"
    :fields="fields"
    :columns="columns"
    :period="period"
    :onReportConfiguration="init"
  ></report-template>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { NCD_TYPES, OpdReportService } from "@/apps/OPD/services/opd_report_service"
import ReportTemplate from "@/views/reports/BaseTableReport.vue"
import table, { ColumnInterface, RowInterface } from "@/components/DataViews/tables/ReportDataTable"
import ReportMixin from '@/apps/ART/views/reports/ReportMixin.vue'
import { border } from '@/apps/OPD/utils/table'

export default defineComponent({
  components: { ReportTemplate },
  mixins: [ReportMixin],
  data: () => ({
    title: 'Cases seen report',
    rows: [] as RowInterface[][], 
    reportService: {} as any,
    columns: [
      [
        table.thTxt('', {colspan: 2, ...border}),
        table.thTxt('New cases', {colspan: 2, ...border}),
        table.thTxt('All cases', {colspan: 2, ...border}),
      ],
      [
        table.thTxt('NCD type', border),
        table.thTxt('Male', border),
        table.thTxt('Female', border),
        table.thTxt('Male', border),
        table.thTxt('Female', border),
      ]
    ] as ColumnInterface[][],
  }),
  created(){
    this.fields = this.getDateDurationFields()
  },
  methods: {
    async init(_: any, config: any){
      this.reportService = new OpdReportService()
      this.reportService.setStartDate(config.start_date)
      this.reportService.setEndDate(config.end_date)
      this.period = this.reportService.getDateIntervalPeriod()
      this.rows = this.buildRows()
      
    },
    buildRows(): RowInterface[][] {
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
