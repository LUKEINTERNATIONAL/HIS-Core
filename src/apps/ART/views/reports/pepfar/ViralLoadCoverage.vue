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
import { uniq } from "lodash";

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
      await this.setFemaleTotalsRow()
    },
    setTotals(key: string, gender: 'M' | 'F', data: Array<any>) {      
      if (!this.totals[gender][key]) this.totals[gender][key] = []

      this.totals[gender][key] = this.totals[gender][key].concat(data)
    },
    drillDown(patients: Array<any>) {
      if (patients.length >= 1) {
        const columns = ['ARV #', 'DOB', 'Gender']
        const onRows = () =>
          patients.map((p: any) => ([
            p.arv_number, 
            this.toDate(p.birthdate), 
            p.gender,
            {
              type: 'button',
              name: 'Show',
              action: () => this.$router.push({ path: `/patient/dashboard/${p.patient_id}`})
            }
          ]))
        return table.tdLink(patients.length, () => this.tableDrill({columns, onRows}))
      }
      return table.td(0)
    },
    async setFemaleTotalsRow() {
      const totals = this.totals.F

      const allF = uniq(Object.values(totals).reduce(
        (all: Array<any>, curr: any) => all.concat(
          curr.map((f: any) => f.patient_id)
        ), []
      ))

      const fStatus = await this.report.getMaternalStatus(allF)

      const allFp = fStatus.FBf.concat(fStatus.FP)

      const fp = (status: 'FBf' | 'FP', fl: Array<any>) => {
        const statuses = fStatus[status]
        return fl.filter((f: any) => statuses.includes(f.patient_id))
      }

      const fnp = (fd: Array<any>) => fd.filter((f: any) => !allFp.includes(f.patient_id))

      this.rows.push([
        table.td('All'),
        table.td('FP'),
        this.drillDown(fp('FP', totals.tx_curr)),
        this.drillDown(fp('FP', totals.due_for_vl)),
        this.drillDown(fp('FP', totals.drawn_routine)),
        this.drillDown(fp('FP', totals.drawn_targeted)),
        this.drillDown(fp('FP', totals.high_vl_routine)),
        this.drillDown(fp('FP', totals.high_vl_targeted)),
        this.drillDown(fp('FP', totals.low_vl_routine)),        
        this.drillDown(fp('FP', totals.low_vl_targeted)),
      ])

      this.rows.push([
        table.td('All'),
        table.td('FNP'),
        this.drillDown(fnp(totals.tx_curr)),
        this.drillDown(fnp(totals.due_for_vl)),
        this.drillDown(fnp(totals.drawn_routine)),
        this.drillDown(fnp(totals.drawn_targeted)),
        this.drillDown(fnp(totals.high_vl_routine)),
        this.drillDown(fnp(totals.high_vl_targeted)),
        this.drillDown(fnp(totals.low_vl_routine)),        
        this.drillDown(fnp(totals.low_vl_targeted)),
      ])
  
      this.rows.push([
        table.td('All'),
        table.td('FBF'),
        this.drillDown(fp('FBf', totals.tx_curr)),
        this.drillDown(fp('FBf', totals.due_for_vl)),
        this.drillDown(fp('FBf', totals.drawn_routine)),
        this.drillDown(fp('FBf', totals.drawn_targeted)),
        this.drillDown(fp('FBf', totals.high_vl_routine)),
        this.drillDown(fp('FBf', totals.high_vl_targeted)),
        this.drillDown(fp('FBf', totals.low_vl_routine)),        
        this.drillDown(fp('FBf', totals.low_vl_targeted)),
      ])
    },
    setAllMalesTotalsRow() {
      const totals = this.totals['M']
      return this.rows.push([
        table.td('All'),
        table.td('Male'),
        this.drillDown(totals.tx_curr),
        this.drillDown(totals.due_for_vl),
        this.drillDown(totals.drawn_routine),
        this.drillDown(totals.drawn_targeted),
        this.drillDown(totals.high_vl_routine),
        this.drillDown(totals.high_vl_targeted),
        this.drillDown(totals.low_vl_routine),
        this.drillDown(totals.low_vl_targeted)
      ])
    },
    async setRows(gender: 'M' | 'F') {
      for (const i in AGE_GROUPS) {
        const group = AGE_GROUPS[i];
        if (group in this.cohort) {
          const cohortData = this.cohort[group];
          const td = (id: string, patients: any) => {
            const filteredPatients =  patients.filter((p: any) => p.gender === gender)
            this.setTotals(id, gender, filteredPatients)
            return this.drillDown(filteredPatients)
          }
          this.rows.push([
            table.td(group),
            table.td(gender),
            td('tx_curr', cohortData.tx_curr),
            td('due_for_vl', cohortData.due_for_vl),
            td('drawn_routine', cohortData.drawn.routine),
            td('drawn_targeted', cohortData.drawn.targeted),
            td('high_vl_routine', cohortData.high_vl.routine),
            td('high_vl_targeted', cohortData.high_vl.targeted),
            td('low_vl_routine', cohortData.low_vl.routine),
            td('low_vl_targeted', cohortData.low_vl.targeted)
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
