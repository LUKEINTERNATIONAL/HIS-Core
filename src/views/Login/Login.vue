<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div id="login" class="container">
        <div class="header">
          <div id="app-name">
            <b style="color: #8b4513">National</b>&nbsp;<b
              style="color: #cd853f"
              >EMR</b
            >
          </div>
          <span>{{ versionDetails.title }}</span
          >| &nbsp;Series: <span>{{ versionDetails.series }}</span
          >| &nbsp;Version: <span>{{ versionDetails.version }}</span>
          &nbsp;
        </div>
        <Inputs v-bind:keys="keys"></Inputs>
      </div>
    </ion-content>
    <ion-footer>
      <span class="" id="coat">
        <img
          class="logos"
          id="mw-img"
          src="/assets/images/login-logos/Malawi-Coat_of_arms_of_arms.png"
          alt="Malawi Coat of Arms logo"
        />
      </span>
      <span class="" id="pepfar">
        <img
          id="donor-img"
          class="logos"
          src="/assets/images/login-logos/PEPFAR.png"
          alt="PEPFAR logo"
        />
      </span>
      <ion-button
        class="config"
        router-link="/settings/host"
        v-if="showConfig()"
      >
        Configuration
      </ion-button>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import Inputs from "./LoginCustomPage.vue";
import { IonButton, IonPage, IonContent, IonFooter } from "@ionic/vue";
import {LOGIN_KEYBOARD} from "@/components/Keyboard/KbLayouts";
export default {
  name: "login",
  components: {
    Inputs,
    IonButton,
    IonPage,
    IonContent,
    IonFooter,
  },
  data() {
    return {
      versionDetails: {
        type: String,
        title: "HIS-EMR",
        version: "1.0.0",
        series: "4",
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
#container {
  margin: 15px;
  /*border-style: solid;
  border-width: 1px;*/
  height: 95%;
}

.logos {
  bottom: 5px;
  width: 90px;
  height: 90px;
  margin-left: 10px;
  /* float: left; */
  /* position: absolute; */
}
.config {
  margin: auto;
  float: right;
  margin-top: 20px;
}
.header span {
  font-weight: bolder;
}

.header {
  border-style: solid;
  height: 40px;
  text-align: right;
  margin: 10px;
  padding-right: 10px;
  border-width: 0px 0px 1px 0px;
  border-color: rgb(204, 204, 204);
}

#app-name {
  float: left;
  font-size: 2.1em;
}
</style>
