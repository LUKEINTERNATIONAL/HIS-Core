<template>
  <his-standard-form
    v-if="!canShowReport"
    @onFinish="onFinish"
    :skipSummary="true" 
    :fields="fields">
  </his-standard-form>
  <ion-page v-if="canShowReport">
    <ion-header>
      <ion-toolbar>
        <ion-row> 
          <ion-col size="2">
            <img class="logo" :src="logo" />
          </ion-col>
          <ion-col>
            <ion-row>
              <ion-col size="2">Title</ion-col> 
              <ion-col> <b>{{ title }}</b> </ion-col>
            </ion-row>
            <ion-row> 
              <ion-col size="2">Period</ion-col> 
              <ion-col> <b>{{ period }}</b> </ion-col>
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
  IonContent,
  IonToolbar, 
  IonRow,
  IonCol,
  loadingController
} from "@ionic/vue"
import { toastDanger } from "@/utils/Alerts";

export default defineComponent({
  components: { HisStandardForm, ReportTable, HisFooter, IonPage, IonContent, IonToolbar, IonRow, IonCol},
  props: {
    title: {
      type: String,
      required: true,
    },
    period: {
      type: String,
      required: true,
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
    onReportConfiguration: {
      type: Function,
      required: true
    }
  },
  data: () => ({
    formData: {} as any,
    computeFormData: {} as any,
    btns: [] as Array<any>,
    isLoadingData: false as boolean,
    canShowReport: false as boolean,
    logo: "/assets/images/login-logos/Malawi-Coat_of_arms_of_arms.png" as string
  }),
  methods: {
    getFileName() {
      return `${this.title}-${this.period}`
    },
    async onFinish(formData: any, computedData: any) {
      this.formData = formData
      this.computeFormData = computedData
      this.canShowReport = true
      await this.presentLoading()
      try {
        await this.onReportConfiguration(this.formData, this.computeFormData)
        loadingController.dismiss ()
      }catch(e) {
        toastDanger(e)
        loadingController.dismiss()
      }
    },
    async reloadReport() {
      await this.onFinish(this.formData, this.computeFormData)
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
          toCsv(columns, rows, this.getFileName())
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
          toTablePDF(columns, rows, this.getFileName())
        }
      })
    }
    this.btns.push({
      name: "Back",
      size: "large",
      slot: "end",
      color: "primary",
      visible: true,
      onClick: () => this.canShowReport = false
    })
    this.btns.push({
      name: "Rebuild",
      size: "large",
      slot: "end",
      color: "danger",
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
</style>
