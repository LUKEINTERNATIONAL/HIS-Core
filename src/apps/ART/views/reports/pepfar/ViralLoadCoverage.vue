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
import { IonPage, modalController } from "@ionic/vue";

export default defineComponent({
  mixins: [ReportMixin],
  components: { ReportTemplate, IonPage },
  data: () => ({
    title: "VL Coverage report",
    cohort: {} as any,
    rows: [] as Array<any>,
    columns: [
      [
        table.thTxt("", { colspan: 5, exportable: false }),
        table.thTxt("Sample Drawn", { colspan: 2, exportable: false }),
        table.thTxt("VL <1000 copies", { colspan: 2, exportable: false }),
        table.thTxt("VL >= 1000 copies", { colspan: 2, exportable: false }),
      ],
      [
        table.thTxt("Age group"),
        table.thTxt("Gender"),
        table.thTxt("TX CURR"),
        table.thTxt("Due for VL"),
        table.thTxt("Routine", { value: 'Routine (Sample Drawn)'}),
        table.thTxt("Targeted", { value:'Targeted (Sample Drawn)'}),
        table.thTxt("Routine", { value: 'Routine (VL <1000 copies)'}),
        table.thTxt("Targeted", { value:'Targeted (VL <1000 copies)'}),
        table.thTxt("Routine", { value: 'Routine (VL >= 1000 copies)'}),
        table.thTxt("Targeted", { value:'Targeted (VL >= 1000 copies)'}),
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
    },
    drillDown(patients: Array<any>, filter: 'M' | 'F') {
        const filteredP = patients.filter((p: any) => p.gender === filter)
        if (filteredP.length >= 1) {
            const columns = [
              [
                table.thTxt('ARV #'),
                table.thTxt('DOB'),
                table.thTxt('Gender'),
                table.thTxt('Action')
              ]
            ]
            const asyncRows = () =>
                filteredP.map((p: any) => ([
                    table.td(p.arv_number), 
                    table.tdDate(p.birthdate), 
                    table.td(p.gender),
                    table.tdBtn('Show', () => modalController.dismiss()
                      .then(() => this.$router.push({ path: `/patient/dashboard/${p.patient_id}`}))
                    )
                ]))
            return table.tdLink(filteredP.length, () => this.drilldownData('Drill table', columns, [], asyncRows))
        }
        return table.td(0)
    },
    async setRows(gender: 'M' | 'F') {
      for (const i in AGE_GROUPS) {
        const group = AGE_GROUPS[i];
        if (group in this.cohort) {
          const cohortData = this.cohort[group];
          this.rows.push([
            table.td(group),
            table.td(gender),
            this.drillDown(cohortData.tx_curr, gender),
            this.drillDown(cohortData.due_for_vl, gender),
            this.drillDown(cohortData.drawn.routine, gender),
            this.drillDown(cohortData.drawn.targeted, gender),
            this.drillDown(cohortData.low_vl.routine, gender),
            this.drillDown(cohortData.low_vl.targeted, gender),
            this.drillDown(cohortData.high_vl.routine, gender),
            this.drillDown(cohortData.high_vl.targeted, gender)
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
