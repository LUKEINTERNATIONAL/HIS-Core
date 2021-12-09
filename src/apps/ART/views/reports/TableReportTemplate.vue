<template>
  <his-standard-form
    v-show="!canShowReport"
    @onFinish="onFinish"
    :skipSummary="true" 
    :fields="fields">
  </his-standard-form>
  <ion-page v-if="canShowReport">
    <ion-header>
      <ion-toolbar>
        <ion-title v-if="showtitleOnly"> 
          <span v-html="title"></span> 
        </ion-title>
        <ion-row v-if="!showtitleOnly">
          <ion-col size="2" v-if="reportLogo">
            <img class="logo" :src="reportLogo"/>
          </ion-col>
          <ion-col>
            <!-- DEFAULT HEADER ROWS -->
            <ion-row>
              <ion-col size="2">Title</ion-col> 
              <ion-col> <b>{{ title }}</b> </ion-col>
            </ion-row>
            <ion-row v-if="period">
              <ion-col size="2">Period</ion-col> 
              <ion-col><b>{{ period }}</b> </ion-col>
            </ion-row>
            <!-- DYNAMIC HEADER ROWS -->
            <ion-row v-for="(info, index) in headerInfoList" :key="index"> 
              <ion-col size="2">
                <ion-label>
                  <span>{{ info.label }}</span> 
                </ion-label>
              </ion-col>
              <ion-col>
                <a href="#" v-if="info && info?.other?.onclick"
                  @click.prevent="info.other.onclick()">
                  {{ info.value }}
                </a>
                <ion-label v-if="info && !info?.other?.onclick">
                  <b><span v-html="info.value"></span></b> 
                </ion-label>
              </ion-col>
            </ion-row>
          </ion-col>
        </ion-row>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="report-content">
        <report-table
          :rows="rows"
          :columns="columns">
        </report-table>
      </div>
    </ion-content>
    <ion-footer> 
      <ion-toolbar> 
        <ion-chip color="primary">Date Created: <b>{{ date }}</b></ion-chip>
        <ion-chip color="primary">His-Core Version: <b>{{ coreVersion }}</b></ion-chip>
        <ion-chip color="primary">Art Version: <b>{{ artVersion }}</b></ion-chip>
        <ion-chip color="primary">API Version: <b>{{ apiVersion }}</b></ion-chip>
      </ion-toolbar>
    </ion-footer>
    <his-footer :btns="btns"></his-footer>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import HisFooter from "@/components/HisDynamicNavFooter.vue";
import ReportTable from "@/components/DataViews/tables/ReportDataTable.vue"
import { Field } from '@/components/Forms/FieldInterface'
import { toCsv, toTablePDF } from "@/utils/Export"
import { toExportableFormat, ColumnInterface, RowInterface} from "@/components/DataViews/tables/ReportDataTable" 
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { 
  IonPage,
  IonHeader,
  IonContent,
  IonFooter,
  IonToolbar, 
  IonRow,
  IonCol,
  IonChip,
  loadingController
} from "@ionic/vue"
import { toastDanger } from "@/utils/Alerts";
import Img from "@/utils/Img"
import { Service } from "@/services/service"
import dayjs from "dayjs";
import { isEmpty } from "lodash";

export default defineComponent({
  components: { 
    HisStandardForm,   
    IonHeader,
    ReportTable, 
    HisFooter, 
    IonPage, 
    IonContent, 
    IonToolbar, 
    IonRow, 
    IonCol,
    IonChip,
    IonFooter
  },
  props: {
    headerInfoList: {
      type: Array,
      default: () => []
    },
    reportPrefix: {
      type: String,
      default: 'HIS-Core'
    },
    reportLogo: {
      type: String,
      default: Img('login-logos/Malawi-Coat_of_arms_of_arms.png')
    },
    showtitleOnly: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      required: true,
    },
    period: {
      type: String
    },
    fields: {
      type: Object as PropType<Field[]>,
      required: true
    },
    columns: {
      type: Object as PropType<Array<ColumnInterface[]>>,
      required: true
    },
    rows: {
      type: Object as PropType<Array<RowInterface[]>>,
      required: true
    },
    customBtns: {
      type: Array,
      default: () => []
    },
    canExportPDf: {
      type: Boolean,
      default: true
    },
    canExportCsv: {
      type: Boolean,
      default: true
    },
    enabledPDFHorizontalPageBreak: {
      type: Boolean,
      default: false
    },
    onReportConfiguration: {
      type: Function,
      required: true
    },
    onDefaultConfiguration: {
      type: Function
    }
  },
  data: () => ({
    date: '',
    formData: {} as any,
    btns: [] as Array<any>,
    computeFormData: {} as any,
    isLoadingData: false as boolean,
    canShowReport: false as boolean,
    apiVersion: Service.getApiVersion(),
    coreVersion: Service.getCoreVersion(),
    artVersion: Service.getAppVersion(),
  }),
  methods: {
    getFileName() {
      return `${this.reportPrefix} ${Service.getLocationName()} ${this.title} ${this.period}`
    },
    /**
     * Loads report without depending on Field configurations
     */
    async onLoadDefault() {
      this.canShowReport = true
      await this.presentLoading()
      try {
        this.date = dayjs().format('YYYY-MM-DD:h:m:s')
        if (this.onDefaultConfiguration) {
          await this.onDefaultConfiguration()
        }
        loadingController.dismiss()
      }catch(e) {
        toastDanger(e)
        console.error(e)
        loadingController.dismiss()
      }
    },
    /**
     * Callback is used when a form has been submitted with report configurations
     */
    async onFinish(formData: any, computedData: any) {
      this.formData = formData
      this.computeFormData = computedData
      this.canShowReport = true
      await this.presentLoading()
      try {
        this.date = dayjs().format('YYYY-MM-DD:h:m:s')
        await this.onReportConfiguration(this.formData, this.computeFormData)
        loadingController.dismiss()
      }catch(e) {
        toastDanger(e)
        console.error(e)
        loadingController.dismiss()
      }
    },
    /**Reinitiate the report with default configurations */
    async reloadReport() {
      if (!isEmpty(this.formData) || !isEmpty(this.computeFormData)) {
        await this.onFinish(this.formData, this.computeFormData)
      }
      if (this.onDefaultConfiguration) {
        await this.onLoadDefault()
      }
    },
    async presentLoading() {
      const loading = await loadingController
        .create({
          message: 'Please wait...',
          backdropDismiss: false
        })
      await loading.present()
    }
  },
  created() {
    if (this.onDefaultConfiguration) {
      this.onLoadDefault()
    } 
    this.btns = this.customBtns
    if (this.canExportCsv) {
      this.btns.push({
        name: "CSV",
        size: "large",
        slot: "start",
        color: "primary",
        visible: true,
        onClick: async () => {
          const {columns, rows} = toExportableFormat(this.columns, this.rows)
          toCsv(
            columns, 
            [
              ...rows,
              [],
              [`Date Created: ${this.date}`],
              // TODO: Get actual HIS-CORE version from a file
              [`HIS-Core Version: ${this.coreVersion}`],
              // TODO: Get actial ART Version from a file
              [`ART Version: ${this.artVersion}`],
              [`API Version: ${this.apiVersion}`]
            ],
            this.getFileName()
          )
        }
      })
    }
    if (this.canExportPDf) {
      this.btns.push({
        name: "PDF",
        size: "large",
        slot: "start",
        color: "primary",
        visible: true,
        onClick: async () => {
          const {columns, rows} = toExportableFormat(this.columns, this.rows)
          toTablePDF(columns, rows, this.getFileName(), this.enabledPDFHorizontalPageBreak)
        }
      })
    }
    this.btns.push({
      name: "Back",
      size: "large",
      slot: "end",
      color: "warning",
      visible: !isEmpty(this.fields),
      onClick: () => this.canShowReport = false
    })
    this.btns.push({
      name: "Refresh",
      size: "large",
      slot: "end",
      color: "warning",
      visible: true,
      onClick: async () => this.reloadReport()
    })
    this.btns.push({
      name: "Finish",
      size: "large",
      slot: "end",
      color: "success",
      visible: true,
      onClick: async () => this.$router.push({ path:'/' })
    })
  }
})
</script>
<style scoped>
.logo {
  width: 100px;
}
.report-content {
  margin: auto;
  width: 99.9%;
  height: 99%;
  overflow: auto;
}
a {
  text-decoration: none;
  font-weight: 600;
  font-size: 1em;
}
</style>
