<template>
  <report-template v-if="rows"
    :title="title"
    :rows="rows" 
    :columns="columns"
    :itemsPerPage="12"
    paginated
  ></report-template>
</template>

<script lang='ts'>
import { defineComponent, onMounted, ref } from 'vue'
import { OpdReportService } from "@/apps/OPD/services/opd_report_service"
import ReportTemplate from "@/views/reports/BaseTableReport.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import HisDate from '@/utils/Date'

export default defineComponent({
  components: { ReportTemplate },
  setup() {
    const title = ref('Clients / Patients with NIDs')
    const rows = ref<any[][]>()
    const columns = ref([[
      table.thTxt('NID'),
      table.thTxt('First Name'),
      table.thTxt('Last Name'),
      table.thTxt('Gender'),
      table.thTxt('DOB'),
      table.thTxt('Date Reg.'),
      table.thTxt('Address'),
    ]])

    onMounted(async () => {
      const reportService = new OpdReportService();
      const data = await reportService.getPatientsWithNIDs()
      if(data) {
        rows.value = data.map((record: any) =>[
          table.td(record.nid),
          table.td(record.given_name),
          table.td(record.family_name),
          table.td(record.gender),
          table.td(HisDate.toStandardHisDisplayFormat(record.birthdate)),
          table.td(HisDate.toStandardHisDisplayFormat(record.date)),
          table.td('')
        ])
      }
    })
    
    return{
      title,
      columns,
      rows,
    }
  },
})
</script>
