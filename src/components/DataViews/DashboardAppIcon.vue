<template>
  <tool-bar-medium-card>
    <ion-img v-if="icon" :src="icon" id="logo"></ion-img>
  </tool-bar-medium-card>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import ToolBarMediumCard from "@/components/Cards/ToolbarMediumCard.vue"
import {
  IonImg
} from "@ionic/vue"
export default defineComponent({
  name: "AppIcon",
  components: { IonImg, ToolBarMediumCard },
  props: {
    icon: {
      type: String,
      required: true
    }
  }
});
</script>
<style scoped>
  #logo {
    margin: auto;
    padding-top: 1em;
    width: 130px;
    height: 80px;
  }
</style>