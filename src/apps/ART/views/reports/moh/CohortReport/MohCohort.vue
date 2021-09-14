<template>
  <his-standard-form
    v-if="!reportReady"
    @onFinish="onPeriod"
    :skipSummary="true" 
    :fields="fields">
  </his-standard-form>
  <ion-page v-if="reportReady">
    <ion-content>
      <div class="report-content" ref="cohort">
        <cohort-v :dataparams="vCohort" ref="validation"> </cohort-v>
        <cohort-h :reportparams="period" ref="header" :clinicName="clinicName"></cohort-h>
        <cohort-ft :onDrillDown="onDrillDown" :params="cohort" :reportid="reportID" :quarter="period" ref="rep"> </cohort-ft>
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
import HisDate from "@/utils/Date"
import { modalController } from "@ionic/vue";

export default defineComponent({
  mixins: [ReportMixinVue],
  components: { CohortH, CohortV, CohortFt, HisStandardForm, HisFooter, IonPage, IonContent },
  data: () => ({
    cohort: {} as any,
    vCohort: {} as any,
    btns: [] as Array<any>,
    fields: [] as Array<Field>,
    reportID: -1 as any,
    clinicName: MohCohortReportService.getUserLocation(),
    reportReady: false as boolean,
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
          this.period = `Custom ${this.report.getDateIntervalPeriod()}`
          data = await this.report.getCohortByDates()
      } else {
          this.report.setQuarter(form.quarter.label)
          data = await this.report.getCohortByQuarter()
          this.period = form.quarter.label
      }
      if (data) {
          this.reportID = data.id
          this.vCohort = data.values
          this.cohort = data.values
      } else {
          toastWarning('Unable to render report')
      }
    },
    async onDrillDown(resourceId: string) {
      const columns = [
        'ARV number', 'Name', 'Gender', 'Birth Date', 'Action'
      ]
      const onRows = async () => {
        const persons = await this.report.getCohortDrillDown(resourceId)
        return persons.map((person: any) => ([
          person['arv_number'],
          `${person['given_name']} ${person['family_name']}`,
          person['gender'],
          HisDate.getAgeInYears(person['birthdate']),
          person['outcome'] || 'N/A',
          {
            type: 'button',
            name: 'Select',
            action: async () => {
              await modalController.dismiss({})
              this.$router.push({ path: `/patient/dashboard/${person.person_id}`})
            }
          }
        ]))
      }
      await this.tableDrill({ columns, onRows })
    },
    getBtns() {
      
      return  [
        {
          name: "CSV",
          size: "large",
          slot: "start",
          color: "primary",
          visible: true,
          onClick: async () => {
            const rep = this.$refs.rep as any
            rep.onDownload()
          }
        },
        {
          name: "PDF",
          size: "large",
          slot: "start",
          color: "primary",
          visible: true,
          onClick: async () => print(),
        },
        {
          name: "Disaggregeted",
          size: "large",
          slot: "end",
          color: "primary",
          visible: true,
          onClick: async () => this.$router.push({ name:'moh_disaggregated' })
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
<style>
.report-content {
  padding: 2em;
  font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
  font-size: 14px;
  line-height: 1.42857143;
  color: #333;
}
@media print {
  ion-footer {
    display: none;
  }
}
</style>