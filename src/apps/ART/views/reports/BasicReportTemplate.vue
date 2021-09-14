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
import jsPDF from "jspdf"
import autoTable from 'jspdf-autotable'
import { isPlainObject } from "lodash"

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
  created() {
    this.btns = [
      ...this.customBtns,
      {
        name: "CSV",
        size: "large",
        slot: "start",
        color: "primary",
        visible: true,
        onClick: async () => this.$router.back()
      },
      {
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
          doc.save(`${this.title}.pdf`)
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

