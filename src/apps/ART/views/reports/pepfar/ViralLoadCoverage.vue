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
import { defineComponent } from "vue";
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue";
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue";
import table from "@/components/DataViews/tables/ReportDataTable";
import { ViralLoadReportService } from "@/apps/ART/services/reports/viral_load_report";
import { AGE_GROUPS } from "@/apps/ART/services/reports/patient_report_service"
import { IonPage } from "@ionic/vue";

export default defineComponent({
  mixins: [ReportMixin],
  components: { ReportTemplate, IonPage },
  data: () => ({
    title: "VL Coverage report",
    cohort: {} as any,
    rows: [] as Array<any>,
    totals: {
      F: {},
      M: {}
    } as any,
    columns: [
      [
        table.thTxt("", { colspan: 5, exportable: false }),
        table.thTxt("Sample Drawn", { colspan: 2, exportable: false }),
        table.thTxt("High VL (>=1000 copies)", { colspan: 2, exportable: false }),
        table.thTxt("Low VL (<1000 copies)", { colspan: 2, exportable: false }),
      ],
      [
        table.thTxt("Age group"),
        table.thTxt("Gender"),
        table.thTxt("TX CURR"),
        table.thTxt("Due for VL"),
        table.thTxt("Routine", { value: 'Routine (Sample Drawn)'}),
        table.thTxt("Targeted", { value:'Targeted (Sample Drawn)'}),
        table.thTxt("Routine", { value: 'Routine (High VL (>=1000 copies))'}),
        table.thTxt("Targeted", { value:'Targeted High VL (>=1000 copies)'}),
        table.thTxt("Routine", { value: 'Routine (Low VL (<1000 copies))'}),
        table.thTxt("Targeted", { value:'Targeted (Low VL (<1000 copies))'}),
      ],
    ],

  }),
  created() {
    this.fields = this.getDateDurationFields();
  },
  methods: {
    async onPeriod(_: any, config: any) {
      this.rows = [];
      this.report = new ViralLoadReportService();
      this.report.setStartDate(config.start_date);
      this.report.setEndDate(config.end_date);
      this.period = this.report.getDateIntervalPeriod();
      this.cohort = await this.report.getVLCoverage();
      await this.setRows("F");
      await this.setRows("M");
      this.setAllMalesTotalsRow()
    },
    setTotals(key: string, gender: 'M' | 'F', data: Array<any>) {      
      if (!this.totals[gender][key]) this.totals[gender][key] = []

      this.totals[gender][key] = this.totals[gender][key].concat(data)
    },
    drillDown(patients: Array<any>, filter: 'M' | 'F', totalsKey = '') {
      const filteredP = patients.filter((p: any) => p.gender === filter)
      if (filteredP.length >= 1) {
        const columns = ['ARV #', 'DOB', 'Gender']
        const onRows = () =>
          filteredP.map((p: any) => ([
            p.arv_number, 
            this.toDate(p.birthdate), 
            p.gender,
            {
              type: 'button',
              name: 'Show',
              action: () => this.$router.push({ path: `/patient/dashboard/${p.patient_id}`})
            }
          ]))
        if (totalsKey) {
          this.setTotals(totalsKey, filter, filteredP)
        } 
        return table.tdLink(filteredP.length, () => this.tableDrill({columns, onRows}))
      }
      return table.td(0)
    },
    setAllMalesTotalsRow() {
      const totals = this.totals['M']
      return this.rows.push([
        table.td('All'),
        table.td('Male'),
        this.drillDown(totals.tx_curr, 'M'),
        this.drillDown(totals.due_for_vl, 'M'),
        this.drillDown(totals.drawn_routine, 'M'),
        this.drillDown(totals.drawn_targeted, 'M'),
        this.drillDown(totals.high_vl_routine, 'M'),
        this.drillDown(totals.high_vl_targeted, 'M'),
        this.drillDown(totals.low_vl_routine, 'M'),
        this.drillDown(totals.low_vl_targeted, 'M'),
      ])
    },
    async setRows(gender: 'M' | 'F') {
      for (const i in AGE_GROUPS) {
        const group = AGE_GROUPS[i];
        if (group in this.cohort) {
          const cohortData = this.cohort[group];
          this.rows.push([
            table.td(group),
            table.td(gender),
            this.drillDown(cohortData.tx_curr, gender, 'tx_curr'),
            this.drillDown(cohortData.due_for_vl, gender, 'due_for_vl'),
            this.drillDown(cohortData.drawn.routine, gender, 'drawn_routine'),
            this.drillDown(cohortData.drawn.targeted, gender, 'drawn_targeted'),
            this.drillDown(cohortData.high_vl.routine, gender, 'high_vl_routine'),
            this.drillDown(cohortData.high_vl.targeted, gender, 'high_vl_targeted'),
            this.drillDown(cohortData.low_vl.routine, gender, 'low_vl_routine'),
            this.drillDown(cohortData.low_vl.targeted, gender,'low_vl_targeted')
          ]);
        } else {
          this.rows.push([
            table.td(group), 
            table.td(gender), 
            table.td(0),
            table.td(0),
            table.td(0),
            table.td(0),
            table.td(0),
            table.td(0),
            table.td(0),
            table.td(0)
          ]);
        }
      }
    },
  },
});
</script>
