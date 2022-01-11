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
      <div class="report-content">
        <report-table
          :rows="rows"
          :paginated="paginated"
          :asyncRows="asyncRows"
          :rowParser="rowParser"
          :columns="columns"
          @onActiveColumns="onActiveColumns"
          @onActiveRows="onActiveRows">
        </report-table>
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

export default defineComponent({
  components: { ReportTable, HisFooter, IonPage, IonContent, IonToolbar, IonChip, IonFooter },
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
    rowParser: {
      type: Function
    },
    asyncRows: {
      type: Function
    },
    paginated: {
      type: Boolean,
      default: false
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
    activeColumns: [] as any,
    activeRows: [] as any,
    date: HisDate.toStandardHisDisplayFormat(Service.getSessionDate()),
    apiVersion: Service.getApiVersion(),
  }),
  methods: {
    onActiveColumns(columns: any) {
      this.activeColumns = columns
    },
    onActiveRows(rows: any) {
      this.activeRows = rows
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
        onClick: () => {
          const {columns, rows} = toExportableFormat(this.activeColumns, this.activeRows)
          toCsv(columns, rows, this.title)
        }
      },
      {
        name: "PDF",
        size: "large",
        slot: "start",
        color: "primary",
        visible: true,
        onClick: () => {
          const {columns, rows} = toExportableFormat(this.activeColumns, this.activeRows)
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

