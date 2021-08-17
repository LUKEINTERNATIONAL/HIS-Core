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
//import { GlobalPropertyService } from "@/services/global_property_service"

export default {
  name: "login",
  components: {
    Inputs
  }
};
</script>


<style scope>
#container {
  margin: 15px;
  /*border-style: solid;
  border-width: 1px;*/
  height: 95%;
}

#donor-img {
  left: 270px;
  height: 120px;
  width: 120px;
}

#mw-img {
  left: 10px;
  width: 190px;
  height: 190px;
}

.logos {
  bottom: 10px;
  width: 120px;
  height: 70px;
  margin-left: 10px;
  float: left;
  position: absolute;
}

</style>
