<template>
  <ion-app>
    <ion-router-outlet :key="$route.fullPath"/>
    <connection-error v-if="!apiOk && notConfigPage"/>
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { defineComponent, ref, watch } from 'vue';
import ApiClient, { ApiBusEvents } from "@/services/api_client"
import EventBus from "@/utils/EventBus"
import { toastWarning, alertConfirmation } from './utils/Alerts';
import { useRoute } from 'vue-router';
import ConnectionError from "@/components/ConnectionError.vue"

/** Nprogress */
import 'nprogress/nprogress.css'
import nprogress from 'nprogress'
import router from '@/router/index';
import { loadingController } from "@ionic/vue"

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet,
    ConnectionError
  },
  setup() {
    const apiOk = ref(true)
    const route = useRoute()
    const notConfigPage = ref(true)
    const healthCheckInterval = ref(null) as any

    nprogress.configure({ 
      easing: 'ease', 
      speed: 870, 
      trickleSpeed:5
    })

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
      ApiBusEvents.BEFORE_API_REQUEST, () => nprogress.start()
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
          if (confirm) location.reload()
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
          }, 2500)
          toastWarning('Unable to reach api. You can fix the error below')
        }
        nprogress.done() 
      }
    )
    return {
      apiOk,
      notConfigPage
    }
  },
});
</script>