<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
          <ion-row> 
            <ion-col size="2">
                <img class="logo" :src="logo" />
            </ion-col>
            <ion-col>
               <ion-row>
                   <ion-col size="2"><b>Title</b></ion-col> 
                   <ion-col> {{ title }} </ion-col>
               </ion-row>
                <ion-row> 
                   <ion-col size="2"><b>Period</b></ion-col> 
                   <ion-col> {{ period }} </ion-col>
               </ion-row>
            </ion-col>
          </ion-row>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="report-content">
        <slot> </slot>
      </div>
    </ion-content>
    <his-footer color="light" :btns="btns"> </his-footer>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TemplateMixinVue from "../TemplateMixin.vue";
export default defineComponent({
  mixins: [TemplateMixinVue],
  data: () => ({
    logo: "/assets/images/login-logos/Malawi-Coat_of_arms_of_arms.png" as string
  })
})
</script>
<style scoped>
.logo {
  width: 100px;
}
</style>

