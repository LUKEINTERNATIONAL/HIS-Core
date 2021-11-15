<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Scan work-station location</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <barcode-input 
        class="his-card"
        @onValue="onbarcodeText" 
        @onScan="onScan">
      </barcode-input>
    </ion-content>
    <ion-footer> 
      <ion-toolbar color="dark"> 
        <ion-button 
          color="danger" 
          size="large" 
          router-link="/login"> 
          Cancel
        </ion-button>
        <ion-button
          slot="end"
          color="success"
          size="large"
          @click="searchLocation"
          v-if="barcodeText"
        > 
          Next 
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import BarcodeInput from "@/components/BarcodeInput.vue"
import {toastWarning} from "@/utils/Alerts"
import router from '@/router/index';
import { Service } from "@/services/service"
import { isEmpty } from 'lodash';
import {
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonButton,
  IonFooter
} from '@ionic/vue';

export default defineComponent({
  name: 'HC location',
  components: {
    BarcodeInput,
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButton,
    IonFooter
  },
  setup() {
    const barcodeText = ref('')

    async function searchLocation() {
      if (!barcodeText.value.includes('$')) {
        barcodeText.value += '$'
      }
      const response = await Service.getJson(`locations/${barcodeText.value}`)
      if (isEmpty(response)) {
        barcodeText.value = ''
        toastWarning("Invalid location")
      }else {
        const data = response
        sessionStorage.userLocation = data.name;
        router.push("/");
      }
    }

    function onbarcodeText(t: string) {
      barcodeText.value = t
    }

    async function onScan(t: string) {
      barcodeText.value = t
      await searchLocation()
    }

    return {
      onbarcodeText,
      onScan,
      searchLocation,
      barcodeText
    }
  }
})
</script>

<style scoped>
.his-card {
  margin: auto;
  width: 95%;
  margin-top: 5%;
}
</style>