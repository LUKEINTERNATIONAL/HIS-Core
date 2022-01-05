<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-row> 
          <ion-col> 
            <h1> {{title}} </h1>
          </ion-col>
        </ion-row>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div v-if="ready" class="report-content">
        <report-table
          :rows="tableRows"
          :columns="columns">
        </report-table>
      </div>
      <div v-else> 
        <text-skeloton/>
      </div>
    </ion-content>
    <ion-footer v-if="showReportStamp"> 
      <ion-toolbar> 
        <ion-chip color="primary">Date Generated: <b>{{ date }}</b></ion-chip>
        <ion-chip color="primary">API version: <b>{{ apiVersion }}</b></ion-chip>
      </ion-toolbar>
    </ion-footer>
    <his-footer :color="footerColor" :btns="btns"></his-footer>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import HisFooter from "@/components/HisDynamicNavFooter.vue";
import { toExportableFormat, ColumnInterface, RowInterface} from "@/components/DataViews/tables/ReportDataTable" 
import ReportTable from "@/components/DataViews/tables/ReportDataTable.vue"
import { IonPage, IonContent, IonToolbar, IonChip, IonFooter } from "@ionic/vue"
import { toCsv, toTablePDF } from "@/utils/Export"
import { Service } from "@/services/service"
import HisDate from "@/utils/Date"
import TextSkeloton from "@/components/TextSkeleton.vue"

export default defineComponent({
  components: { TextSkeloton, ReportTable, HisFooter, IonPage, IonContent, IonToolbar, IonChip, IonFooter },
  props: {
    title: {
      type: String,
      required: true,
    },
    columns: {
      type: Object as PropType<Array<ColumnInterface[]>>,
      required: true
    },
    rows: {
      type: Object as PropType<Array<RowInterface[]>>,
      default: () => []
    },
    asyncRows: {
      type: Function
    },
    customBtns: {
      type: Array,
      default: () => []
    },
    showReportStamp: {
      type: Boolean,
      default: true
    },
    footerColor: {
      type: String,
      default: 'dark'
    },
    onFinish: {
      type: Function
    }
  },
  data: () => ({
    btns: [] as Array<any>,
    date: HisDate.toStandardHisDisplayFormat(Service.getSessionDate()),
    apiVersion: Service.getApiVersion(),
    ready: false as boolean,
    tableRows: [] as Array<any>
  }),
  watch: {
    rows: {
      handler(rows: Array<any>) {
        if (rows) {
          this.tableRows = rows
        }
        this.ready = true
      },
      immediate: true,
      deep: true
    },
    asyncRows: {
      async handler(loader: Function) {
        if (typeof loader === 'function') {
          this.ready = false
          this.tableRows = await loader()
          this.ready = true
        }
      },
      immediate: true,
      deep: true
    }
  },
  created() {
    this.btns = [
      ...this.customBtns,
      {
        name: "CSV",
        size: "large",
        slot: "start",
        color: "primary",
        visible: true,
        onClick: async () => {
          const {columns, rows} = toExportableFormat(this.columns, this.tableRows)
          toCsv(columns, rows, this.title)
        }
      },
      {
        name: "PDF",
        size: "large",
        slot: "start",
        color: "primary",
        visible: true,
        onClick: async () => {
          const {columns, rows} = toExportableFormat(this.columns, this.tableRows)
          toTablePDF(columns, rows, this.title)
        }
      },
      {
        name: "Finish",
        size: "large",
        slot: "end",
        color: "success",
        visible: true,
        onClick: () => {
          if (typeof this.onFinish === 'function') {
            return this.onFinish()
          }
          this.$router.push({ path:'/' })
        }
      }
    ]
  }
})
</script>

