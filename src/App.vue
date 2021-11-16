<template>
  <ion-app>
    <ion-router-outlet :key="$route.fullPath"/>
    <div id="api-error" class="his-card" v-if="!apiOk && notConfigPage">
      <p>
        Unable to connect to BHT-API. 
        Please check: 
        <ul> 
          <li> Your configuration </li>
          <li> The service is running </li>
          <li> Your network cable is ok </li>
        </ul> 
      </p>
      <ion-button 
        router-link='/settings/host' 
        color="warning"> 
        New Config
      </ion-button>
      <ion-button @click="refresh" color="warning"> 
        Refresh
      </ion-button>
    </div>
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet, IonButton } from '@ionic/vue';
import { defineComponent, ref, watch } from 'vue';
import ApiClient, { ApiBusEvents } from "@/services/api_client"
import EventBus from "@/utils/EventBus"
import { toastDanger } from './utils/Alerts';
import { useRoute } from 'vue-router';
export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonButton,
    IonRouterOutlet
  },
  setup() {
    const apiOk = ref(true)
    const route = useRoute()
    const notConfigPage = ref(true)

    function refresh() {
      location.reload()
    }

    // Do the annoying health checks every X amount of Miliseconds
    setInterval(() => ApiClient.healthCheck(), 8000)

    watch(route, (route) => 
      notConfigPage.value = route.name != 'API host settings',
      {
        immediate: true
      }
    )

    EventBus.on(ApiBusEvents.API_SUCCESS, 
      () => apiOk.value = true
    )
    EventBus.on(ApiBusEvents.UNREACHABLE_API, 
      () => {
        if (apiOk.value) {
          toastDanger('Unable to reach api. You can fix the error below')
          apiOk.value = false
        }
      }
    )
    return {
      apiOk,
      refresh,
      notConfigPage
    }
  },
});
</script>
<style scoped>
  #api-error {
    bottom: 0;
    position: absolute;
    background: red;
    color: white;
    font-weight: bold;
    width: 50vw;
    bottom: 30px; /* Position Y halfway in */
    left: 50%; /* Position X halfway in */
    transform: translate(-50%,-50%); /* Move it halfway back(x,y) */
    text-align: center;
    z-index: 40;
  }
</style>