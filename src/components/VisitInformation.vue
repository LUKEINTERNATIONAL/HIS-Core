<template>
  <ion-grid>
    <ion-row>
      <ion-col size="2" class="headers">Date</ion-col>
      <ion-col size="2" class="headers">Weight</ion-col>
      <ion-col size="2" class="headers">Reg</ion-col>
      <ion-col size="2" class="headers">ADH</ion-col>
      <ion-col size="2" class="headers">Out</ion-col>
      <ion-col size="2" class="headers">Act</ion-col>
    </ion-row>
    <ion-row v-for="(item, index) in items" :key="index">
      <ion-col size="2"><ion-button @click="printLabel(item.value)"> {{item.label}} </ion-button></ion-col>
      <ion-col size="2"><p>{{item.data.weight}}</p> </ion-col>
      <ion-col size="2"><p>{{item.data.regimen}}</p> </ion-col>
      <ion-col size="2"><p>0%</p></ion-col>
      <ion-col size="2"><p>{{item.data.outcome}}</p></ion-col>
      <ion-col size="2"><ion-button color="success">show more</ion-button></ion-col>
    </ion-row>
  </ion-grid>
</template>
<script lang="ts">
import { defineComponent, PropType } from "vue";
import { IonGrid, IonRow, IonCol, IonButton } from "@ionic/vue";
export default defineComponent({
  name: "HisResultCard",
  components: {
    IonGrid,
    IonRow,
    IonCol,
    IonButton
  },
  props: {
    icon: {
      required: false,
    },
    items: {
      type: Object as PropType<any[]>,
      required: true,
    },
  },
  methods: {
    printLabel(date: any) {
      this.$emit("onPrint", date);
    }
  },
});
</script>
<style scoped>
.data {
  border-bottom: solid 1px black;
}
p {
}
.val {
  font-weight: bold;
}
.headers {
  border: 1px solid black;
}
ion-col {
  text-align: center;
}
</style>