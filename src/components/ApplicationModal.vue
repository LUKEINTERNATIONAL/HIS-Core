<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Select Module</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-row>
       <ion-col v-for="app, index in apps" :key="index" size="4">
        <application-card @click="setApplication(app)" :name="app.applicationName" :details="app.applicationDescription" :programID="app.programID" :iconURL="app.applicationIcon"></application-card>
       </ion-col>
     </ion-row>
  </ion-content>
</template>

<script>
import HisApps from "@/apps/his_apps"
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCol, IonRow, modalController } from '@ionic/vue';
import { defineComponent } from 'vue';
import ApplicationCard from '@/components/ApplicationCard'
import {toastDanger} from "@/utils/Alerts"
import { find } from "lodash"

export default defineComponent({
  name: 'Modal',
  props: {
    title: { type: String, default: '' },
  },
  methods: {
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
  components: { IonContent, IonHeader, IonTitle, IonToolbar, ApplicationCard, IonCol, IonRow}
});
</script>