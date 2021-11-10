<template>
  <div>
  <ion-menu menu-id="app-menu" content-id="main-content" type="overlay">
    <ion-header>
      <ion-toolbar>
        <ion-title> {{title}} </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item
          v-for="(p, i) in appPages" :key="i"
          :router-link="p.url" 
          detail="true" 
          class="hydrated"
          >
          <ion-label>{{ p.title }}</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-menu>
  <ion-header> 
    <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
          <ion-title> {{ title }} </ion-title>
        </ion-buttons>
        <ion-buttons slot="end"> 
            <ion-thumbnail> 
                <img :src="appIconPath" class="logo" alt="Master card logo"/>
            </ion-thumbnail>
        </ion-buttons>
    </ion-toolbar>
  </ion-header>
</div>
</template>
<script lang="ts">
import Img from "@/utils/Img"
import { defineComponent } from "vue";
import {
  IonContent,
  IonItem,
  IonList,
  IonMenu,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonThumbnail,
  IonToolbar,
  IonHeader,
  IonLabel
} from "@ionic/vue";
export default defineComponent({
  name: "App",
  props: {
    title: String,
    subtitle: String,
    appIcon: {
        type: String,
        required: true
    }
  },
  components: {
    IonContent,
    IonItem,
    IonList,
    IonTitle,
    IonMenu,
    IonButtons,
    IonMenuButton,
    IonThumbnail,
    IonToolbar,
    IonHeader,
    IonLabel
  },
  setup(props) {
    const appPages = [
      {
        title: "Dashboard",
        url: "/emc/home",
      },
      {
        title: "Search/ Create client",
        url: "/emc/newpatient",
      },
      {
        title: "Reports",
        url: "/emc/reports",
      },
      {
        title: "Data cleaning tools",
        url: "/emc/cleaningtools",
      },
      {
        title: "Users",
        url: "/emc/users",
      },
    ];
    return {
      appPages,
      appIconPath: Img(props.appIcon)
    }
  },
});
</script>