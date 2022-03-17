<template>
  <ion-content class="ion-padding">
       <ion-list>
            <ion-item button @click="settings()" >Settings</ion-item>
            <ion-item button @click="report()" >Reports</ion-item>
          </ion-list>
  </ion-content>
</template>

<script>
import { IonContent } from '@ionic/vue';
import { defineComponent } from 'vue';
import {popoverController } from '@ionic/vue';

export default defineComponent({
  name: 'Popover',
  components: { IonContent },
  methods:{  
    async settings() {
            await popoverController.dismiss({})
     this.$router.push('/settings');
    },
    async report() {
            await popoverController.dismiss({})
     this.$router.push('/triageReport');
    },
  }
});
</script>