<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Select activities</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content>
    <ion-grid>
      <ion-row>
        <ion-col v-for="(entries, index) in multiViewActivities" :key="index" :size="singleView ? 12: 6" >
         <div class="his-card clickable" v-for="(entry, index) in entries" :key="index" @click="entry.selected = !entry.selected"> 
            <ion-row >
              <ion-col size="1" style="border-right: 1px solid gray; mouse: ">
                <ion-checkbox v-model="entry.selected" />
              </ion-col>
              <ion-col class="ion-text-center">
                {{ entry.value }}
              </ion-col>
            </ion-row>
          </div>
        </ion-col>
      </ion-row>
    </ion-grid>
  </ion-content>
  <ion-footer>
    <ion-toolbar>
      <ion-button @click="postActivities" color="success" :disabled="selectedActivities.length == 0" size="large" style="float: right;">finish</ion-button>
    </ion-toolbar>
  </ion-footer>
</template>
<script lang="ts">
import {
  IonContent,
  IonButton,
  IonHeader,
  IonTitle,
  IonToolbar,
  modalController,
  IonCheckbox,
} from "@ionic/vue";
import { defineComponent, PropType } from "vue";
import { toastWarning } from "@/utils/Alerts"
import ApiClient from "@/services/api_client";
import { ActivityInterface } from "@/apps/interfaces/AppInterface"
import { chunk } from "lodash";

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
  watch: {
    activities: {
      handler(activities: Array<ActivityInterface>){
        if (activities) {
          this.appActivities = [...activities]
          this.getActivities();
        }
      },
      immediate: true
    }
  },
  methods: {
    async getActivities() {
      //
      const response = await ApiClient.get(
        `/user_properties?property=activities`
      );

      if (!response || response.status !== 200) {
        //
        toastWarning("Could not get user activities");
      } 
      else {
        //
        const data: any = await response.json();
        this.appActivities = this.appActivities.map((el) => {
          if (data.property_value.search(el.value) >= 0) {
            el.selected = true;
          }
          return el;
        });
      }
    },
    async postActivities() {
      const userActivities = {
        property: "activities",
        'property_value': this.selectedActivities,
      };
      const response = await ApiClient.post(`/user_properties`, userActivities);

      if (!response || response.status !== 201) {
        toastWarning("Could not save activities");
        //
      } else {
        await modalController.dismiss();
      }
    },
  },
  computed: {
    selectedActivities(): string {
      return this.appActivities
        .filter((element) => element.selected == true)
        .map((el) => el.value )
        .join(",");
    },
    singleView(): boolean {
      const size = this.appActivities.length
      if (size > this.splitFactor) 
        return  false
      return true
    },
    multiViewActivities():  Array<ActivityInterface[]>{
      const size = this.singleView 
        ? this.appActivities.length 
        : Math.ceil(this.appActivities.length/2)
      return chunk(this.appActivities, size)
    }
  },
  data() {
    return {
      content: "Content",
      appActivities: [] as Array<ActivityInterface>,
      splitFactor: 7
    };
  },
  components: {
    IonButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCheckbox,
  },
});
</script>
<style scoped>
 .his-card {
    padding: 0.55em;
    margin: .5em;
 }

</style>
