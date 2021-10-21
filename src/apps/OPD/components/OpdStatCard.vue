<template>
  <ion-card :style="bgColor">
    <ion-card-content>
      <ion-card-subtitle>{{ label }}</ion-card-subtitle>
      <ion-card-subtitle>{{ value }}</ion-card-subtitle>
    </ion-card-content>
  </ion-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IonCard, IonCardContent, IonCardSubtitle } from "@ionic/vue";
 
export default defineComponent({
  props: {
    label: String,
    value: Number,
    color: String
  },
  components: {
    IonCard,
    IonCardContent, 
    IonCardSubtitle
  },
  setup(props){
    return {
      bgColor: `background-color: ${props.color ?? ''}`
    }
  }
})
</script>

<style scoped>
ion-card {
  margin: 0;
  border-radius: 8px;
}

ion-card-subtitle {
  text-align: center;
  font-weight: bold
}
</style>
