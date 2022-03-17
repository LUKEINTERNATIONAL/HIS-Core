<template>
  <ion-content class="ion-padding">
       <ion-list>
            <ion-list-header><b style="font-size:15px;">Admin</b></ion-list-header>
            <ion-item button @click="logout()">Logout</ion-item>
          </ion-list>
  </ion-content>
</template>

<script lang="ts">
import { IonContent } from '@ionic/vue';
import { defineComponent } from 'vue';
import {popoverController } from '@ionic/vue';
import { delayPromise } from "@/utils/Timers"

export default defineComponent({
  name: 'Popover',
  components: { IonContent },
  methods:{
    async logout() {
        await popoverController.dismiss({})
        sessionStorage.clear();
        this.$router.push('/login')
      
    }
  }
});
</script>
