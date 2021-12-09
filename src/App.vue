<template>
  <ion-app>
    <ion-router-outlet :key="$route.fullPath"/>
    <div id="api-error" class="his-card" v-if="!apiOk && notConfigPage">
      <p>
        Unable to connect to BHT-API. 
        Please check: 
        <ul :style="{listStyle:'none'}"> 
          <li> Check the HIS-Core configuration file </li>
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
import { toastWarning, toastDanger, alertConfirmation } from './utils/Alerts';
import { useRoute } from 'vue-router';
/** Nprogress */
import 'nprogress/nprogress.css'
import nprogress from 'nprogress'
import router from '@/router/index';
import { loadingController } from "@ionic/vue"

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
    const healthCheckInterval = ref(null) as any

    nprogress.configure({ 
      easing: 'ease', 
      speed: 870, 
      trickleSpeed:1 
    })

    function refresh() {
      location.reload()
    }

    watch(route, (route) => 
      notConfigPage.value = route.name != 'API host settings',
      {
        immediate: true
      }
    )

    watch(healthCheckInterval, (interval: any) => {
      apiOk.value = !interval
    })
  
    EventBus.on(
      ApiBusEvents.BEFORE_API_REQUEST, 
      () => nprogress.start()
    )

    EventBus.on(
      ApiBusEvents.AFTER_API_REQUEST,
      async (res: any) => {
        if (healthCheckInterval.value) {
          clearInterval(healthCheckInterval.value)
          healthCheckInterval.value = null
          const confirm = await alertConfirmation(
            'Do you want to refresh the page?',
            'API connection is back'
          )
          if (confirm) refresh()
        }
        if (res && res.status === 401 && route.name != 'Login') {
          router.push('/login')
        }
        nprogress.done()
      }
    )

    EventBus.on(
      ApiBusEvents.ON_API_CRASH, 
      () => {
        if (!healthCheckInterval.value) {
          loadingController.dismiss() // Cancel any loading controller behaviour
          healthCheckInterval.value = setInterval(() => {
            if (route.name != 'API host settings') {
              ApiClient.healthCheck()
            }
          }, 1000)
          toastWarning('Unable to reach api. You can fix the error below')
        }
        nprogress.done()
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