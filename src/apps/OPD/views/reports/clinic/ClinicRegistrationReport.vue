<template>
  <report-template v-if="rows"
    :title="title"
    :rows="rows"
    :fields="fields"
    :columns="columns"
    :itemsPerPage="10"
    :period="period"
    :reportReady="reportReady"
    :isLoading="isLoading"
    :onReportConfiguration="init"
    :customBtns="customBtns"
    paginated
  ></report-template>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { OpdReportService } from "@/apps/OPD/services/opd_report_service"
import ReportTemplate from "@/views/reports/BaseTableReport.vue"
import table, { ColumnInterface, RowInterface } from "@/components/DataViews/tables/ReportDataTable"
import HisDate from '@/utils/Date'
import ReportMixin from '@/apps/ART/views/reports/ReportMixin.vue'
import { modalController } from '@ionic/core'
import SummaryModal from "@/apps/OPD/components/RegistrationSummaryModal.vue";

export default defineComponent({
  components: { ReportTemplate },
  mixins: [ReportMixin],
  data: () => ({
    title: 'Clinic Registration',
    rows: [] as RowInterface[][], 
    isLoading: false,
    reportReady: false,
    reportData: [] as any,
    columns: [[
      table.thTxt('Reg'),
      table.thTxt('First Name'),
      table.thTxt('Last Name'),
      table.thTxt('Gender'),
      table.thTxt('DOB'),
      table.thTxt('Date reg.'),
      // table.thTxt('Address'),
    ]] as ColumnInterface[][],
    customBtns: [] as any
  }),
  created(){
    this.fields = this.getDateDurationFields()
    this.customBtns.push({
      name: "High level view",
      size: "large",
      slot: "start",
      color: "primary",
      visible: true,
      onClick: async () => this.showModal()
    })
    
  },
  methods: {
    async init(_: any, config: any){
      this.reportReady = true
      this.isLoading = true
      const reportService = new OpdReportService()
      reportService.setStartDate(config.start_date)
      reportService.setEndDate(config.end_date)
      this.period = reportService.getDateIntervalPeriod()
      const data = await reportService.getClinicRegistrations()
      this.reportData = data.sort((a: any, b: any) => 
        a.visit_type > b.visit_type ? 1 : a.visit_type < b.visit_type ? -1 : 0
      )
      this.rows = this.buildRows(this.reportData)
    },
    buildRows(data: any[]): RowInterface[][] {
      if(!data.length) return []
      return data.map((record: any) => [
        table.td(record.visit_type),
        table.td(record.given_name),
        table.td(record.family_name),
        table.td(record.gender),
        table.td(HisDate.toStandardHisDisplayFormat(record.birthdate)),
        table.td(HisDate.toStandardHisDisplayFormat(record.visit_date)),
        // table.td(''),
      ])
    },
    async showModal() {
      const data = [
        { label: "New patient", value: [...this.reportData.filter((d: any) => d.visit_type === 'New patient')].length },
        { label: "Referral", value: [...this.reportData.filter((d: any) => d.visit_type === 'Referral')].length },
        { label: "Revisiting", value: [...this.reportData.filter((d: any) => d.visit_type === 'Revisiting')].length }
      ]
      const modal = await modalController.create({
        component: SummaryModal,
        backdropDismiss: true,
        cssClass: 'action-sheet-modal',
        componentProps: {
          list: data
        } 
      })
      modal.present()
    }
  },
})
</script>
