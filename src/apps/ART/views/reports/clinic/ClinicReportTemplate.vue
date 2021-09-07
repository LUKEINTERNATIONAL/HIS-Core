<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <h1> <b>{{ title }}</b> ({{ period }}) </h1>
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
import { defineComponent } from "vue";
import HisFooter from "@/components/HisDynamicNavFooter.vue";
import { IonPage, IonContent, IonToolbar } from "@ionic/vue"

export default defineComponent({
  components: { HisFooter, IonPage, IonContent, IonToolbar },
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
            onClick: async () => this.$router.back()
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

