<template >
 <ion-card class="his-card">
    <center> 
      <ion-img :src="iconURL"></ion-img>
      <ion-card-header>
        <ion-card-title>{{name}}</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <b>{{details}}</b>
      </ion-card-content>
    </center>
  </ion-card> 
</template>

<script>
import { IonCard, IonCardContent, IonCardTitle, IonCardHeader, IonImg } from '@ionic/vue';
import { defineComponent } from 'vue';

export default defineComponent({
    props: ['name', 'details', 'programID', 'iconURL'],
  components: { IonCard, IonCardContent, IonCardTitle,  IonCardHeader, IonImg},
  setup() {
    return {  };
  },
  methods: {   
    getImgUrl(url) {
        return require(`@/assets ${url}`);
    }
  }
});
</script>
<style scoped>
.his-card {
  height: 35vh;
  overflow: 'hidden';
}
ion-img {
  width: 150px;
  height: 120px;
}
</style>