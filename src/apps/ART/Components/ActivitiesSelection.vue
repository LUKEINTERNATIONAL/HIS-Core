<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Select activities</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-list style="height: 90%; overflow-x: auto;">
      <ion-row>
        <ion-col width-50>
          <ion-item v-for="(entry, index) in leftLs" :key="index" color="light">
            <ion-label> {{ entry.value }} </ion-label>
            <ion-checkbox v-model="entry.selected" slot="start"/>
          </ion-item>
        </ion-col>
        <ion-col width-50>
          <ion-item v-for="(entry, index) in rightLs" :key="index" color="light">
            <ion-label> {{ entry.value }} </ion-label>
            <ion-checkbox v-model="entry.selected" slot="start"/>
          </ion-item>
        </ion-col>
      </ion-row>
    </ion-list>
    <ion-button @click="postActivities" :disabled="selectedActivities.length == 0" style="float: right">finish</ion-button>
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
    leftLs(): any {
      return this.appActivities.filter( (element, index) => index < 5)
    },
    rightLs(): any {
      return this.appActivities.filter( (element, index) => index > 5)
    }
  },
  data() {
    return {
      content: "Content",
      appActivities: [] as Array<ActivityInterface>
    };
  },
  components: {
    IonButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonLabel,
    IonList,
    IonItem,
    IonCheckbox,
  },
});
</script>