<template>
  <ion-page>
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
        <slot> </slot>
      </div>
    </ion-content>
    <his-footer color="light" :btns="btns"> </his-footer>
  </ion-page>
</template>

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
    totalClients: {
      type: Object
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
    logo: "/assets/images/login-logos/Malawi-Coat_of_arms_of_arms.png" as string,
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
<style scoped>
.logo {
  width: 100px;
}
</style>

