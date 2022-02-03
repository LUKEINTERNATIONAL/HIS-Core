<template>
  <ion-grid>
    <ion-row>
      <ion-col v-for="stat in patientSummaryStats" :key="stat.label">
        <opd-stat-card
          :label="stat.label"
          :value="stat.value"
          :color="stat.color ?? ''"
        />
      </ion-col>
    </ion-row>
    <ion-row>
      <ion-col>
        <opd-stat-chart
          :series="accumulativeVisits.visits"
          :categories="accumulativeVisits.days"
        ></opd-stat-chart>
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { IonGrid, IonRow, IonCol} from "@ionic/vue";
import OpdStatCard from '@/apps/OPD/components/OpdStatCard.vue'
import OpdStatChart from '@/apps/OPD/components/OpdStatChart.vue'
import PatientVisitsService from '@/apps/OPD/services/patient_visits_service'

export default defineComponent({
  components: {
    OpdStatCard,
    OpdStatChart,
    IonGrid, 
    IonRow, 
    IonCol
  },
  setup() {
    const data = PatientVisitsService.getStatistics()
    const patientSummaryStats = computed(() => {
      return data.value ? PatientVisitsService.getTodaysPatientVisits(data.value?.top) : []
    })
    const accumulativeVisits = computed(() => {
      return data.value ? PatientVisitsService.getAccumulativePatientVisits(data.value?.down) : {
        days: [] as Array<string>,
        visits: [] as Array<any>
      }
    })
    return {
      patientSummaryStats,
      accumulativeVisits,
    }
  },
})
</script>

<style scoped>
ion-col {
  padding: 0; 
  margin: 0.5rem .1rem;
}
</style>
