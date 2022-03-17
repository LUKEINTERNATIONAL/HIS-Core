<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Scan work-station location</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <barcode-scan></barcode-scan>
    </ion-content>
    <HisNavFooter @onCancel="gotoMain()" :showNext="false" @onFinish="gotoHome"></HisNavFooter>
  </ion-page>
</template>

<script lang="ts">
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from '@ionic/vue';
import { defineComponent } from 'vue';
import BarcodeScan from '@/components/BarcodeScan.vue';
import HisNavFooter from "@/components/HisNavFooter.vue";

export default defineComponent({
  name: 'HC location',
  components: {
    HisNavFooter,
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    "barcode-scan": BarcodeScan
  },
  methods: {
    gotoHome(){
      this.$router.push({path: "/"})
    },
    gotoMain() {
      this.$router.push({path: "/login"})
    }
  }
});
</script>

<style scoped>
.container {
  margin: auto;
  /* text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 20%;
  transform: translateY(-50%);
  background-color: #F0F0F0;
  border-style: solid;
  border-width: 1px;
  border-radius: 9px;
  height: 20%;
  margin: 3%; */
}

.loc-footer {
    height: 10% !important;
    background-color: #333 !important;
}

.footer-btns {
  margin-left: 1%;
  margin-top: 1%;
  height: 8vh;
}

 @media only screen and (max-width: 900px) {
   #container {
     top: 20%;
     height: 15%;
   }
 }

</style>