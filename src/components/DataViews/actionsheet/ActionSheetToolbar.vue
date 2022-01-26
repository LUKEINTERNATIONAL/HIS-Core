<template>
    <ion-header>
        <ion-toolbar>
            <ion-title class="ion-text-center">
                <h4 :class="color">  {{ title }}  </h4>
                <h2><b v-if="subtitle"> {{ subtitle }} </b></h2>
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
<style scoped>
h2 {
    padding-bottom: .2em;
}
</style>
