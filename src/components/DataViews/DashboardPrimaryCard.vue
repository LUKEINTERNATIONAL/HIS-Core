<template>
    <div class="card"> 
        <div class="title-card" :style="{backgroundColor: titleColor}">
            <ion-badge color="light">{{ counter }}</ion-badge>
            {{title}} 
        </div>
        <ion-list>
            <ion-item v-for="(item, index) in items" :key="index" :style="{fontSize: '0.8em'}">
                <ion-label> {{ item.label }} </ion-label>
                <ion-chip v-if="item.value" slot='end'>
                  <ion-icon :icon="icon"></ion-icon>
                    <ion-label>{{ item.value }}</ion-label>
                </ion-chip>
            </ion-item>
        </ion-list>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Option } from "@/components/Forms/FieldInterface"
import { time } from "ionicons/icons";
import { 
    IonLabel, 
    IonList, 
    IonItem,
    IonChip,
    IonIcon,
    IonBadge
} from "@ionic/vue";
export default defineComponent({
    components: {
        IonLabel, 
        IonList, 
        IonItem,
        IonChip,
        IonIcon,
        IonBadge
    },
    data: () => ({
        time
    }),
    props: {
        counter: {
            type: Number,
            required: false
        },
        icon: {
            type: Object   
        },
        title: {
            type: String,
            required: true
        },
        items: {
            type: Object as PropType<Option[]>
        },
        titleColor: {
            type: String,
            required: false,
            default: () => '#337ab7'
        }
    }
})
</script>
<style scoped>
.card {
  width: 100%;
  border-radius: 6px;
  border: 1px solid #ccc;
  height: 32.8vh;
  background-color: rgb(255, 255, 255);
  overflow: hidden;
  -webkit-box-shadow: 0px -2px 19px -2px rgba(196, 190, 196, 1);
  -moz-box-shadow: 0px -2px 19px -2px rgba(196, 190, 196, 1);
  box-shadow: 0px -2px 19px -2px rgba(196, 190, 196, 1);  
}
.card:active {
    transform: translateY(4px);
}
.title-card {
    padding: 8px;
    width: 100%;
    color: white;
}
</style>