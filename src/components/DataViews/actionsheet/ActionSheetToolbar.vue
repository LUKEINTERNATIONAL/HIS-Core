<template>
    <ion-header>
        <ion-toolbar>
            <ion-title class="ion-text-center">
                <h4 :class="color">  {{ title }} </h4>
                <b v-if="subtitle"> {{ subtitle }} </b>
            </ion-title>
        </ion-toolbar>
  </ion-header>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
    IonToolbar,
    IonTitle,
    IonHeader
} from "@ionic/vue"

export default defineComponent({
    components: { IonToolbar, IonTitle, IonHeader },
    props: {
        title: {
            type: String,
            required: true,
        },
        subtitle: {
            type: String
        },
        color: {
            type: String
        }
    }
})
</script>
