<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Select Module</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content>
    <ion-row>
       <ion-col 
          v-for="app, index in apps" 
          :key="index"
          size-md="4" 
          size-sm="12">
        <application-card 
          @click="setApplication(app)" 
          :name="app.applicationName" 
          :details="app.applicationDescription" 
          :programID="app.programID" 
          :iconURL="img(app.applicationIcon)">
        </application-card>
       </ion-col>
     </ion-row>
  </ion-content>
  <ion-footer> 
    <ion-toolbar> 
      <ion-button 
        color="danger" 
        size="large"
        @click="closeModal"
        v-if="canClose"> 
        Close 
      </ion-button>
    </ion-toolbar>
  </ion-footer>
</template>
<script>
import HisApps from "@/apps/his_apps"
import { defineComponent } from 'vue';
import ApplicationCard from '@/components/ApplicationCard'
import {toastDanger} from "@/utils/Alerts"
import { find } from "lodash"
import Img from "@/utils/Img"
import { 
  IonContent, 
  IonFooter,
  IonHeader, 
  IonButton,
  IonTitle, 
  IonToolbar, 
  IonCol, 
  IonRow, 
  modalController 
} from '@ionic/vue';
export default defineComponent({
  name: 'Modal',
  props: {
    title: { type: String, default: '' },
    canClose: {
      type: Boolean,
      default: () => false
    }
  },
  methods: {
    closeModal() {
      modalController.dismiss()
    },
    img: (name) => Img(name),
    async setApplication(app) { await modalController.dismiss(app) },
  },
  async mounted() {
    try {
      const req = await fetch('/config.json')
      const { apps } = await req.json()
      this.apps = HisApps.filter((app) => {
        const appFound = find(apps, { name :  app.applicationName})
        return (appFound && appFound.available === true)
      })
    }catch(e) {
      console.error(e)
      toastDanger('An error occured while loading applications')
    }
  },
  data() {
    return {
      content: 'Content',
      apps: []
    }
  },
  components: { 
    IonFooter, 
    IonContent, 
    IonHeader, 
    IonTitle,
    IonToolbar, 
    ApplicationCard, 
    IonButton,
    IonCol, 
    IonRow
  }
});
</script>