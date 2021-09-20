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
    <his-footer :btns="btns"></his-footer>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import HisFooter from "@/components/HisDynamicNavFooter.vue";
import ReportTable from "@/components/DataViews/tables/ReportDataTable.vue"
import { IonPage, IonContent, IonToolbar} from "@ionic/vue"
import { isPlainObject } from "lodash"
import { toCsv, toTablePDF } from "@/utils/Export"

export default defineComponent({
  components: { ReportTable, HisFooter, IonPage, IonContent, IonToolbar },
  props: {
    title: {
      type: String,
      required: true,
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
    }
  },
  data: () => ({
    btns: [] as Array<any>
  }),
  methods: {
    getExportRows() {
      return this.rows.map((d: any) => d.map((c: any) => isPlainObject(c) ? c.value : c))
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
        onClick: async () => toCsv(this.columns, this.getExportRows(), this.title)
      },
      {
        name: "PDF",
        size: "large",
        slot: "start",
        color: "primary",
        visible: true,
        onClick: async () => toTablePDF(this.columns, this.getExportRows(), this.title)
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

