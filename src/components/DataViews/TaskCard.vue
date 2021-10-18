<template>
    <ion-card class="his-card task-card clickable">
        <ion-item>
            <ion-thumbnail slot="start">
                <img :src="icon"/>
            </ion-thumbnail>
            <ion-label class="title">{{title}}</ion-label>
        </ion-item>
    </ion-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
    IonCard,
    IonThumbnail,
    IonItem,
    IonLabel
} from "@ionic/vue"
export default defineComponent({
    components: {
        IonCard, 
        IonThumbnail, 
        IonItem, 
        IonLabel
    },
    props: {
        title: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: false
        }
    }
})
</script>
<style scoped>
    .title {
        font-size: 0.7em;
        font-weight: 600;
        color: #333333;
    }
    .task-card {
        padding: 0;
        margin: 0;
        height: 73px;
        overflow: hidden;
    }
</style>
