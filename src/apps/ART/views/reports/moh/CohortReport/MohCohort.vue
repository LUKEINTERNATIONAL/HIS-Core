<template>
  <ion-loading
    :is-open="isLoading"
    message="Please wait..."
  >
  </ion-loading>
  <his-standard-form
    v-if="!reportReady"
    @onFinish="onPeriod"
    :skipSummary="true" 
    :fields="fields">
  </his-standard-form>
  <ion-page v-if="reportReady">
    <ion-content>
      <cohort-v :key="componentKey" :dataparams="vCohort" ref="validation"> </cohort-v>
      <div id="report-content">
        <cohort-h :key="componentKey" :reportparams="period" ref="header" :clinicName="clinicName"></cohort-h>
        <cohort-ft :key="componentKey" :onDrillDown="onDrillDown" :params="cohort" :reportid="reportID" :quarter="period" ref="rep"> </cohort-ft>
      </div>
    </ion-content>
    <his-footer :btns="btns"></his-footer>
  </ion-page>
  <div id='print'> </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import HisFooter from "@/components/HisDynamicNavFooter.vue";
import { IonPage, IonContent, IonLoading } from "@ionic/vue"
import { Field } from '@/components/Forms/FieldInterface'
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import ReportMixinVue from "../../ReportMixin.vue";
import { MohCohortReportService } from "@/apps/ART/services/reports/moh_cohort_service"
import CohortH from "@/apps/ART/views/reports/moh/CohortReport/CohortHeader.vue"
import CohortV from "@/apps/ART/views/reports/moh/CohortReport/CohortValidation.vue"
import CohortFt from "@/apps/ART/views/reports/moh/CohortReport/CohortFT.vue"
import HisDate from "@/utils/Date"
import Url from "@/utils/Url"
import { modalController } from "@ionic/vue";
import { delayPromise } from "@/utils/Timers";

export default defineComponent({
  mixins: [ReportMixinVue],
  components: { IonLoading, CohortH, CohortV, CohortFt, HisStandardForm, HisFooter, IonPage, IonContent },
  data: () => ({
    formData: {} as any,
    componentKey: 0 as number,
    computedFormData: {} as any,
    cohort: {} as any,
    vCohort: {} as any,
    btns: [] as Array<any>,
    isLoading: false as boolean,
    fields: [] as Array<Field>,
    reportID: -1 as any,
    clinicName: MohCohortReportService.getUserLocation(),
    reportReady: false as boolean,
    reportUrlParams: '' as string
  }),
  created() {
    this.btns = this.getBtns()
    this.fields = this.getDateDurationFields(true, true)
  },
  methods: {
    async onPeriod(form: any, config: any, regenerate=false) {
      this.componentKey += 1
      this.formData = form
      this.computedFormData = config
      this.reportReady = true 
      this.isLoading = true
      this.report = new MohCohortReportService()
      this.report.setRegenerate(regenerate)
      let data: any = {}

      if (form.quarter.value === 'custom_period') {
        this.report.setStartDate(config.start_date)
        this.report.setEndDate(config.end_date)
        this.period = `Custom ${this.report.getDateIntervalPeriod()}`
        data = this.report.datePeriodRequestParams()
      } else {
        this.report.setQuarter(form.quarter.label)
        data = this.report.qaurterRequestParams()
        this.period = form.quarter.label
        this.reportUrlParams = Url.parameterizeObjToString({ 
          'start_date': form.quarter.other.start,
          'end_date': form.quarter.other.end,
          'quarter': form.quarter.label
        })
      }
      const request = await this.report.requestCohort(data)
      if (request.ok) {
        // Check the backend if background task is complete
        const interval = setInterval(async () => {
          data.regenerate = false
          const state = await this.report.requestCohort(data)
          if (state.status === 200) {
            const data = await state.json()
            this.reportID = data.id
            this.vCohort = data.values
            this.cohort = data.values
            this.isLoading = false
            this.report.cacheCohort(data.values)
            clearInterval(interval)
          }
        }, 3000)
      }
    },
    async printSpec() {
      const printW = open('', '', 'width:1024px, height:768px')
      const content = document.getElementById('report-content')
      if (content && printW) {
        printW.onload = () => printW.document.write(`
            <html>
              <head>
                <title>Print Cohort</title>
                <link rel="stylesheet" media="print" href="/assets/css/cohort.css" />
              </head>
              <body>
                ${content.innerHTML}
              </body>
            </html>
          `)
          setTimeout(() => { printW.print();printW.close() }, 1100)
      }
    },
    async regenerate() {
      await this.onPeriod(this.formData, this.computedFormData, true)
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
          onClick: () => this.printSpec()
        },
        {
          name: "Regenerate",
          size: "large",
          slot: "end",
          color: "danger",
          visible: true,
          onClick: async () => this.regenerate()
        },
        {
          name: "Disaggregeted",
          size: "large",
          slot: "end",
          color: "primary",
          visible: true,
          onClick: () => document.location = `/art/report/moh/moh_disaggregated?${this.reportUrlParams}` as any
        },
        {
          name: "Finish",
          size: "large",
          slot: "end",
          color: "success",
          visible: true,
          onClick: () => this.$router.push({ path:'/' })
        }
      ]   
    }
  }
})
</script>
