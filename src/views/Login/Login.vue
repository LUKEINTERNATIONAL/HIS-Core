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
        <ion-label slot="end">
          Version: <b>{{ versionDetails.version }}</b>
        </ion-label>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <inputs v-bind:keys="keys"></inputs>
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <span>
          <img
            id="coat"
            src="/assets/images/login-logos/Malawi-Coat_of_arms_of_arms.png"
            alt="Malawi Coat of Arms logo"
          />
          <img
            id="pepfar"
            src="/assets/images/login-logos/PEPFAR.png"
            alt="PEPFAR logo"
          />
        </span>
        <ion-button
          class="config"
          router-link="/settings/host"
          v-if="showConfig()">
          Configuration
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import Inputs from "./LoginCustomPage.vue";
import {LOGIN_KEYBOARD} from "@/components/Keyboard/KbLayouts";
import { 
  IonButton, 
  IonPage, 
  IonContent, 
  IonFooter,
  IonHeader,
  IonToolbar
} from "@ionic/vue";
export default {
  name: "login",
  components: {
    Inputs,
    IonButton,
    IonPage,
    IonHeader,
    IonToolbar,
    IonContent,
    IonFooter,
  },
  data() {
    return {
      versionDetails: {
        type: String,
        version: "1.0.0",
      },
      keys: LOGIN_KEYBOARD,
    };
  },
  methods: {
    showConfig(): boolean {
      if (localStorage.getItem("useLocalStorage") === "true") return true;
      return false;
    },
  },
};
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
.config {
  margin: auto;
  float: right;
  margin-top: 20px;
}
</style>
