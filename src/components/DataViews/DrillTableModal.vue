<template>
  <ion-header>
    <ion-toolbar>
      <ion-title> {{ title }} </ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <div v-if="ready">
      <his-basic-table :columns="columns" :rows="rows"> </his-basic-table>
    </div>
    <div v-else>
      <center><h1>Loading data, Please wait.....</h1></center>
    </div>
  </ion-content>

  <ion-footer>
    <ion-toolbar>
      <ion-button color="danger" @click="closeModal" slot="end">
        Close
      </ion-button>
    </ion-toolbar>
  </ion-footer>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import HisBasicTable from "./HisBasicTable.vue";
import { modalController } from "@ionic/vue";
export default defineComponent({
  components: { HisBasicTable },
  props: {
    title: {
      type: String,
      required: true,
    },
    columns: {
      type: Object as PropType<string[]>,
      required: true,
    },
    onRows: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    rows: [] as Array<any>,
    ready: false,
  }),
  watch: {
    onRows: {
      async handler(func: Function) {
        if (func) {
          this.rows = await func();
          this.ready = true;
        }
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    async closeModal() {
      await modalController.dismiss({});
    },
  },
});
</script>
