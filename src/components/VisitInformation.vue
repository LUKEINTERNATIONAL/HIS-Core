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
    <ion-row>
      <ion-col size="2"><ion-button> 22/Jan/2021 </ion-button></ion-col>
      <ion-col size="2"><p>13</p> </ion-col>
      <ion-col size="2"><p>13A</p> </ion-col>
      <ion-col size="2"><p>89%</p></ion-col>
      <ion-col size="2"><p>Defaulted</p></ion-col>
      <ion-col size="2"><ion-button color="success">show more</ion-button></ion-col>
    </ion-row>
  </ion-grid>
</template>
<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Option } from "@/components/Forms/FieldInterface";
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
      type: Object as PropType<Option[]>,
      required: true,
    },
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