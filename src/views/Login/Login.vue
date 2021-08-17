<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div id="login" class="container">
        <div class="header">
          <span>{{versionDetails.title}}</span>|
          &nbsp;Series: <span>{{versionDetails.series}}</span>|
          &nbsp;Version: <span>{{versionDetails.version}}</span>
        </div>
        <Inputs v-bind:keys="keys"></Inputs>

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
      versionDetails: {
        type: String,
        title: "HIS-EMR",
        version: "1.0.0",
        series: "4"
      },
      keys: [
        ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
        ["q","w","e","r","t","y","u","i","o","p"],
        ["a","s","d","f","g","h","j","k","l","Del."],
        ["z","x","c","v","b","n","m", "Caps","Login"]
      ] 
    }
  }
};
</script>


<style scoped>
#container {
  margin: 15px;
  /*border-style: solid;
  border-width: 1px;*/
  height: 95%;
}

#donor-img {
  left: 120px;
}

#mw-img {
  left: 10px;
  width: 90px;
  height: 90px;
}

.logos {
  bottom: 5px;
  width: 65px;
  height: 65px;
  margin-left: 10px;
  float: left;
  position: absolute;
}

.header span{
  font-weight: bolder;
}

.header {
  border-style: solid;
  border-width: 0px 0px 3px 0px;
  height: 40px;
  text-align: right;
  margin: 10px;
  padding-right: 10px;
}

</style>
