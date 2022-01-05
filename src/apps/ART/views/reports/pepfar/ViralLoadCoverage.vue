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
    drillDown(patients: Array<any>, context: string) {
      if (patients.length >= 1) {
        const columns = [
          [
            table.thTxt('ARV #'),
            table.thTxt('DOB'),
            table.thTxt('Gender')
          ]
        ]
        const asyncRows = () =>
          patients.map((p: any) => ([
            table.td(p.arv_number), 
            table.tdDate(p.birthdate), 
            table.td(p.gender),
            table.tdBtn('Show', () => this.$router.push({ path: `/patient/dashboard/${p.patient_id}`}))
          ]))
        return table.tdLink(patients.length, () => this.drilldownData(context, columns, [], asyncRows))
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
        this.drillDown(fp('FP', totals.tx_curr), 'TX CURR FP'),
        this.drillDown(fp('FP', totals.due_for_vl), 'Due for VL FP'),
        this.drillDown(fp('FP', totals.drawn_routine), 'Routine (Sample Drawn) FP'),
        this.drillDown(fp('FP', totals.drawn_targeted), 'Targetted (Sample Drawn) FP'),
        this.drillDown(fp('FP', totals.high_vl_routine), 'Routine (High VL (>=1000 copies)) FP'),
        this.drillDown(fp('FP', totals.high_vl_targeted), 'Targeted High VL (>=1000 copies) FP'),
        this.drillDown(fp('FP', totals.low_vl_routine), 'Routine (Low VL (<1000 copies)) FP'),  
        this.drillDown(fp('FP', totals.low_vl_targeted), 'Targeted (Low VL (<1000 copies)) FP'),
      ])

      this.rows.push([
        table.td('All'),
        table.td('FNP'),
        this.drillDown(fnp(totals.tx_curr), 'TX CURR FNP'),
        this.drillDown(fnp(totals.due_for_vl), 'Due for VL FNP'),
        this.drillDown(fnp(totals.drawn_routine), 'Routine (Sample Drawn) FNP'),
        this.drillDown(fnp(totals.drawn_targeted), 'Targetted (Sample Drawn) FNP'),
        this.drillDown(fnp(totals.high_vl_routine), 'Routine (High VL (>=1000 copies)) FNP'),
        this.drillDown(fnp(totals.high_vl_targeted), 'Targeted High VL (>=1000 copies) FNP'),
        this.drillDown(fnp(totals.low_vl_routine), 'Routine (Low VL (<1000 copies)) FNP'),        
        this.drillDown(fnp(totals.low_vl_targeted), 'Targeted (Low VL (<1000 copies)) FNP'),
      ])
  
      this.rows.push([
        table.td('All'),
        table.td('FBF'),
        this.drillDown(fp('FBf', totals.tx_curr), 'TX CURR FBf'),
        this.drillDown(fp('FBf', totals.due_for_vl), 'Due for VL FBf'),
        this.drillDown(fp('FBf', totals.drawn_routine), 'Routine (Sample Drawn) FBf'),
        this.drillDown(fp('FBf', totals.drawn_targeted), 'Targetted (Sample Drawn) FBf'),
        this.drillDown(fp('FBf', totals.high_vl_routine), 'Routine (High VL (>=1000 copies)) FBf'),
        this.drillDown(fp('FBf', totals.high_vl_targeted), 'Targeted High VL (>=1000 copies) FBf'),
        this.drillDown(fp('FBf', totals.low_vl_routine), 'Routine (Low VL (<1000 copies)) FBf'),        
        this.drillDown(fp('FBf', totals.low_vl_targeted), 'Targeted (Low VL (<1000 copies)) FBf'),
      ])
    },
    setAllMalesTotalsRow() {
      const totals = this.totals['M']
      return this.rows.push([
        table.td('All'),
        table.td('Male'),
        this.drillDown(totals.tx_curr, 'TX CURR Male'),
        this.drillDown(totals.due_for_vl, 'Due for VL Male'),
        this.drillDown(totals.drawn_routine, 'Routine (Sample Drawn) Male'),
        this.drillDown(totals.drawn_targeted, 'Targetted (Sample Drawn) Male'),
        this.drillDown(totals.high_vl_routine, 'Routine (High VL (>=1000 copies)) Male'),
        this.drillDown(totals.high_vl_targeted, 'Targeted High VL (>=1000 copies) Male'),
        this.drillDown(totals.low_vl_routine, 'Routine (Low VL (<1000 copies)) Male'),
        this.drillDown(totals.low_vl_targeted, 'Targeted (Low VL (<1000 copies)) Male')
      ])
    },
    async setRows(gender: 'M' | 'F') {
      for (const i in AGE_GROUPS) {
        const group = AGE_GROUPS[i];
        if (group in this.cohort) {
          const cohortData = this.cohort[group];
          const td = (id: string, patients: any, context: string) => {
            const filteredPatients =  patients.filter((p: any) => p.gender === gender)
            this.setTotals(id, gender, filteredPatients)
            return this.drillDown(filteredPatients, context)
          }
          this.rows.push([
            table.td(group),
            table.td(gender),
            td(
              'tx_curr', cohortData.tx_curr, `${group} TX CURR (${gender})`
            ),
            td(
              'due_for_vl', cohortData.due_for_vl, `${group} Due for VL (${gender})`
            ),
            td(
              'drawn_routine', cohortData.drawn.routine, `${group} Routine (Sample Drawn) (${gender})`
            ),
            td(
              'drawn_targeted', cohortData.drawn.targeted, `${group} Targeted (Sample Drawn) (${gender})`
            ),
            td(
              'high_vl_routine', cohortData.high_vl.routine, `${group} Routine (High VL (>=1000 copies)) (${gender})`
            ),
            td(
              'high_vl_targeted', cohortData.high_vl.targeted, `${group} Targeted High VL (>=1000 copies) (${gender})`
            ),
            td(
              'low_vl_routine', cohortData.low_vl.routine, `${group} Routine (Low VL (<1000 copies)) (${gender})`
            ),
            td(
              'low_vl_targeted', cohortData.low_vl.targeted, `${group} Targeted (Low VL (<1000 copies)) (${gender})`
            )
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
