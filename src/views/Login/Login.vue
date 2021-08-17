<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div id="login" class="table-container">
       
        <Inputs v-bind:inputs="inputs"></Inputs>

        <img src="../../../public/assets/images/login-logos/Malawi-Coat_of_arms_of_arms.png" class="logos" id="mw-img" />
        <img src="../../../public/assets/images/login-logos/PEPFAR.png" class="logos" id="donor-img" />
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">

import Inputs from "./LoginCustomPage.vue";

export default {
  name: "login",
  components: {
    Inputs
  },
  data() {
    return {
      keys: [
        ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
        ["q","w","e","r","t","y","u","i","o","p"],
        ["a","s","d","f","g","h","j","k","l","Del."],
        ["z","x","c","v","b","n","m", "Hide","Caps"]
      ] 
    }
  }
};
</script>


<style scoped>

</style>
