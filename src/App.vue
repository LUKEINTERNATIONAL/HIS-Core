<template>
  <ion-app>
    <ion-router-outlet :key="$route.fullPath"/>
    <div id="api-error" class="his-card" v-if="!apiOk && notConfigPage">
      <p>
        Unable to connect to BHT-API. 
        Please check: 
        <ul :style="{listStyle:'none'}"> 
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
import { toastWarning, toastDanger } from './utils/Alerts';
import { useRoute } from 'vue-router';
/** Nprogress */
import 'nprogress/nprogress.css'
import nprogress from 'nprogress'
import router from '@/router/index';

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
    
    nprogress.configure({ 
      easing: 'ease', 
      speed: 870, 
      trickleSpeed:1 
    })

    function refresh() {
      location.reload()
    }

    // Do the annoying health checks every X amount of Miliseconds
    setInterval(() => ApiClient.healthCheck(), 10000)

    watch(route, (route) => 
      notConfigPage.value = route.name != 'API host settings',
      {
        immediate: true
      }
    )

    EventBus.on(
      ApiBusEvents.BEFORE_API_REQUEST, 
      (url: string) => {
        // Use stealth for health checks
        if (url != '_health') {
          nprogress.start()
        }
      }
    )

    EventBus.on(
      ApiBusEvents.AFTER_API_REQUEST, 
      async (res: any) => {
        if (res && res.status === 401 && route.name != 'Login') {
          router.push('/login')
        } else if (res.status >= 500) {
          const { error, exception } = await res.json();
          toastDanger(`${error} - ${exception}`);
        }
        apiOk.value = true
        nprogress.done()
      }
    )

    EventBus.on(
      ApiBusEvents.ON_API_CRASH, 
      () => {
        if (apiOk.value) {
          toastWarning('Unable to reach api. You can fix the error below')
          apiOk.value = false
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