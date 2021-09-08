<script lang="ts">
import { defineComponent, PropType } from "vue";
import HisFooter from "@/components/HisDynamicNavFooter.vue";
import { IonPage, IonContent, IonToolbar, IonRow, IonCol} from "@ionic/vue"
import jsPDF from "jspdf"
import autoTable from 'jspdf-autotable'
import { isPlainObject } from "lodash"

export default defineComponent({
  components: { HisFooter, IonPage, IonContent, IonToolbar, IonRow, IonCol},
  props: {
    title: {
      type: String,
      required: true,
    },
    period: {
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
            name: "Print Csv",
            size: "large",
            slot: "start",
            color: "primary",
            visible: true,
            onClick: async () => this.$router.back()
        },
        {
            name: "Print PDF",
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
        },
        {
            name: "Back",
            size: "large",
            slot: "end",
            color: "primary",
            visible: true,
            onClick: async () => this.$router.back()
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
});
</script>

