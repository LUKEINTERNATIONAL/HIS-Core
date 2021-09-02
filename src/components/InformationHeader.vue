<template>
  <ion-grid>
    <ion-row>
      <ion-col size="4" v-for="item in items" :key="item" class="data">
        <ion-row>
          <ion-col siz="6" ><p> {{ item.label }}</p></ion-col>
          <ion-col siz="6" ><p class="val">{{ item.value }}</p> </ion-col>
        </ion-row>
      </ion-col>
    </ion-row>
  </ion-grid>
</template>
<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Option } from "@/components/Forms/FieldInterface";
import {
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/vue";
export default defineComponent({
  name: "HisResultCard",
    components: {   
 IonGrid,
  IonRow,
  IonCol,
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
	font-size: 13px;
}
.val {
	font-weight: bold;
}
</style>