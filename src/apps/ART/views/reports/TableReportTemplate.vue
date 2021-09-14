<template>
  <his-standard-form
    v-if="!reportReady"
    @onFinish="onReportConfiguration"
    :skipSummary="true" 
    :fields="fields">
  </his-standard-form>
  <ion-page v-if="reportReady">
    <ion-header>
      <ion-toolbar>
        <ion-row> 
          <ion-col size="2">
            <img class="logo" :src="logo" />
          </ion-col>
          <ion-col>
            <ion-row>
              <ion-col size="2"><b>Title</b></ion-col> 
              <ion-col> {{ title }} </ion-col>
            </ion-row>
            <ion-row> 
              <ion-col size="2"><b>Period</b></ion-col> 
              <ion-col> {{ period }} </ion-col>
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
import { IonPage, IonContent, IonToolbar, IonRow, IonCol} from "@ionic/vue"
import { Field } from '@/components/Forms/FieldInterface'
import jsPDF from "jspdf"
import autoTable from 'jspdf-autotable'
import { isPlainObject } from "lodash"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";

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
      type: Object as PropType<string[]>,
      required: true
    },
    rows: {
      type: Object as PropType<string[]>,
      required: true
    },
    customBtns: {
      type: Array,
      default: () => []
    },
    reportReady: {
      type: Boolean,
      required: true,
      default: false
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
    btns: [] as Array<any>,
    logo: "/assets/images/login-logos/Malawi-Coat_of_arms_of_arms.png" as string
  }),
  created() {
    this.btns = this.customBtns
    if (this.canExportPDf) {
      this.btns.push({
        name: "CSV",
        size: "large",
        slot: "start",
        color: "primary",
        visible: true,
        onClick: async () => this.$router.back()
      })
    }
    if (this.canExportCsv) {
      this.btns.push({
        name: "PDF",
        size: "large",
        slot: "start",
        color: "primary",
        visible: true,
        onClick: async () => {
          const doc = new jsPDF()
          const rows = this.rows.map((d: any) => d.map((c: any) => isPlainObject(c) ? c.value : c))
          autoTable(doc, {
            head: [this.columns],
            body: rows
          })
          doc.save(`${this.title}-${this.period}.pdf`)
        }
      })
    }
    this.btns.push({
      name: "Finish",
      size: "large",
      slot: "end",
      color: "primary",
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
