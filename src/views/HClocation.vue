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
        :clearValue="clearValue"
        :virtualText="kbText"
        @onValue="onbarcodeText" 
        @onScan="onScan">
      </barcode-input>
    </ion-content>
    <his-keyboard
      v-if="isTouchPlatform"
      :kbConfig="NUMBERS" 
      :onKeyPress="onKbClick"> 
    </his-keyboard>
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
  IonFooter,
  getPlatforms
} from '@ionic/vue';
import HisKeyboard from '@/components/Keyboard/HisKeyboard.vue';
import {NUMBERS} from "@/components/Keyboard/HisKbConfigurations"

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
    IonFooter,
    HisKeyboard
  },
  setup() {
    const barcodeText = ref('')
    const clearValue = ref('')
    const kbText = ref('')
    const isTouchPlatform = getPlatforms().filter(p => [
      'ios', 
      'iphone', 
      'android', 
      'mobileweb', 
      'tablet'
    ].includes(p)).length >= 1

    async function searchLocation() {
      if (!barcodeText.value.includes('$')) {
        barcodeText.value += '$'
      }
      const response = await Service.getJson(`locations/${barcodeText.value}`)
      if (isEmpty(response)) {
        toastWarning("Invalid location")
      }else {
        const data = response
        sessionStorage.siteUUID = data.uuid
        sessionStorage.userLocation = data.name;
        router.push("/");
      }
      clearValue.value = barcodeText.value
      barcodeText.value = ''
      kbText.value = barcodeText.value
    }

    function onbarcodeText(t: string) {
      barcodeText.value = t
    }

    function onKbClick(t: string) {
      kbText.value = t
    }

    async function onScan(t: string) {
      barcodeText.value = t
      await searchLocation()
    }

    return {
      onbarcodeText,
      onScan,
      onKbClick,
      searchLocation,
      isTouchPlatform,
      kbText,
      clearValue,
      barcodeText,
      NUMBERS
    }
  }
})
</script>

<style scoped>
.his-floating-keyboard  {
  bottom: 70px!important;
}
.his-card {
  margin: auto;
  width: 95%;
}
</style>