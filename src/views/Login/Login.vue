<template>
  <ion-page>
    <ion-header> 
      <ion-toolbar>
        <ion-title> 
          <ion-label :style="{fontWeight: 'bolder', fontSize: '1.9em'}"> 
            <b style="color: #8b4513">National </b>
            <b style="color: #cd853f">EMR</b>
          </ion-label>
        </ion-title>
        <ion-label class="ion-padding" slot="end">
          Version: <b>{{ version }}</b>
        </ion-label>
      </ion-toolbar>
    </ion-header>
    <ion-content fullscreen="false">
      <inputs></inputs>
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <span>
          <img
            id="coat"
            :src="coatImg"
            alt="Malawi Coat of Arms logo"
          />
          <img
            id="pepfar"
            :src="pepfarImg"
            alt="PEPFAR logo"
          />
        </span>
        <ion-button
          slot="end"
          class="config"
          router-link="/settings/host"
          v-if="showConfig">
          Configuration
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import Inputs from "./LoginCustomPage.vue";
import { 
  IonButton, 
  IonPage, 
  IonContent, 
  IonFooter,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonLabel
} from "@ionic/vue";
import img from '@/utils/Img';
export default {
  name: "login",
  components: {
    Inputs,
    IonButton,
    IonTitle,
    IonLabel,
    IonPage,
    IonHeader,
    IonToolbar,
    IonContent,
    IonFooter,
  },
  setup() {
    return {
      version: "1.0.0",
      coatImg: img('login-logos/Malawi-Coat_of_arms_of_arms.png'),
      pepfarImg: img('login-logos/PEPFAR.png'),
      showConfig: localStorage.getItem("useLocalStorage") === "true"
    }
  }
}
</script>
<style scoped>
#coat {
  width: 8vw;
  height: 8vw;
}
#pepfar {
  width: 6vw;
  height: 6vw;
}
</style>
