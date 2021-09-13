<template>
  <his-standard-form
    v-if="!reportReady"
    @onFinish="onPeriod"
    :skipSummary="true" 
    :fields="fields">
  </his-standard-form>
  <ion-page v-if="reportReady">
    <ion-content>
      <div class="report-content">
        <cohort-h :reportparams="period"></cohort-h>
        <cohort-v :dataparams="vCohort"> </cohort-v>
        <cohort-ft :params="cohort" :reportid="reportID" :quarter="period" ref="rep"> </cohort-ft>
      </div>
    </ion-content>
    <his-footer :btns="btns"></his-footer>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import HisFooter from "@/components/HisDynamicNavFooter.vue";
import { IonPage, IonContent } from "@ionic/vue"
import { Field } from '@/components/Forms/FieldInterface'
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import ReportMixinVue from "../../ReportMixin.vue";
import { MohCohortReportService } from "@/apps/ART/services/reports/moh_cohort_service"
import CohortH from "@/apps/ART/views/reports/moh/CohortReport/CohortHeader.vue"
import CohortV from "@/apps/ART/views/reports/moh/CohortReport/CohortValidation.vue"
import CohortFt from "@/apps/ART/views/reports/moh/CohortReport/CohortFT.vue"
import { toastWarning } from '@/utils/Alerts'

export default defineComponent({
  mixins: [ReportMixinVue],
  components: { CohortH, CohortV, CohortFt, HisStandardForm, HisFooter, IonPage, IonContent },
  data: () => ({
    cohort: {} as any,
    vCohort: {} as any,
    btns: [] as Array<any>,
    fields: [] as Array<Field>,
    reportID: -1 as any,
    reportReady: false as boolean
  }),
  created() {
    this.btns = this.getBtns()
    this.fields = this.getDateDurationFields(true, true)
  },
  methods: {
    async onPeriod(form: any, config: any) {
        this.reportReady = true 
        this.report = new MohCohortReportService()
        let data: any = {}

        if (form.quarter.value === 'custom_period') {
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = form.quarter.label
            data = await this.report.getCohortByDates()
        } else {
            this.report.setQuarter(form.quarter.label)
            data = await this.report.getCohortByQuarter()
            this.period = ''
        }
        if (data) {
            this.reportID = data.id
            this.vCohort = data.values
            this.cohort = data.values
        } else {
            toastWarning('Unable to render report')
        }
    },
    getBtns() {
        return  [
            {
                name: "CSV",
                size: "large",
                slot: "start",
                color: "primary",
                visible: true,
                onClick: async () => alert('Csv printed')
            },
            {
                name: "PDF",
                size: "large",
                slot: "start",
                color: "primary",
                visible: true,
                onClick: async () => alert('PDF printed')
            },
            {
                name: "Disaggregeted",
                size: "large",
                slot: "end",
                color: "primary",
                visible: true,
                onClick: async () => this.$router.push({ path:'/' })
            },
            {
                name: "Finish",
                size: "large",
                slot: "end",
                color: "success",
                visible: true,
                onClick: async () => this.$router.push({ path:'/' })
            }
        ]   
    }
  }
})
</script>
