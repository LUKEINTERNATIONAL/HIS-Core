<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Stock levels (Consumption rate calculated over a 3 month period)</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
      <apexchart
          width="100%"
          type="bar"
          :options="options"
          :series="series"
        ></apexchart>
  </ion-content>
</template>
<script lang="ts">
import {
  IonContent,
  IonButton,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonLabel,
  modalController,
  IonList,
  IonItem,
  IonCheckbox,
} from "@ionic/vue";
import { defineComponent, PropType } from "vue";
import { toastWarning } from "@/utils/Alerts"
import ApiClient from "@/services/api_client";
import { ActivityInterface } from "@/apps/interfaces/AppInterface"

export default defineComponent({
  name: "Modal",
  props: {
    activities: {
      type: Object as PropType<ActivityInterface[]>,
      required: true
    },
    title: {
      type: String, 
      default: ""
    },
  },
  methods: {
    //
  },
  data() {
    return {
      options: {
        chart: {
          id: "vuechart-example",
        },
        plotOptions: {
              bar: {
                borderRadius: 4,
                horizontal: true,
              }
            },
            grid: {
  // row: {
  //   colors: ['#F44336', '#E91E63', '#9C27B0']
  // },
  column: {
    colors: ['#FFFFFF', '#FFFFFF', 'green']
  }
}
        // xaxis: {
        //   categories: ["", "", "", "", ""],
        // },
      },
      series: [
        {
          name: "complete",
          data: [5, 9, 2, 3, 4],
        }
      ],
    };
  },
  components: {
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
  },
});
</script>