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
          :columns="columns">
        </report-table>
      </div>
    </ion-content>
    <ion-footer> 
      <ion-toolbar> 
        <ion-chip color="primary">Date Generated: <b>{{ date }}</b></ion-chip>
        <ion-chip color="primary">API version: <b>{{ apiVersion }}</b></ion-chip>
      </ion-toolbar>
    </ion-footer>
    <his-footer :btns="btns"></his-footer>
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
      required: true
    },
    customBtns: {
      type: Array,
      default: () => []
    }
  },
  data: () => ({
    btns: [] as Array<any>,
    date: HisDate.toStandardHisDisplayFormat(Service.getSessionDate()),
    apiVersion: Service.getApiVersion()
  }),
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
          const {columns, rows} = toExportableFormat(this.columns, this.rows)
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
          const {columns, rows} = toExportableFormat(this.columns, this.rows)
          toTablePDF(columns, rows, this.title)
        }
      },
      {
        name: "Finish",
        size: "large",
        slot: "end",
        color: "primary",
        visible: true,
        onClick: async () => this.$router.push({ path:'/' })
      }
    ]
  }
})
</script>

