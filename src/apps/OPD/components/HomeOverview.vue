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
          :series="series"
          :categories="categories"
        ></opd-stat-chart>
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
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
    const patientSummaryStats = ref()
    const categories = ref<string[]>([])
    const series = ref<any[]>([])
    
    onMounted(async function() {
      try {
        const {todaysVisits, accumulativeVisits } = await PatientVisitsService.fetchPatientStats()
        patientSummaryStats.value = todaysVisits
        categories.value = accumulativeVisits?.days
        series.value = accumulativeVisits?.visits
      } catch (e) {
        console.log(e)
      }
    })

    return {
      patientSummaryStats,
      series,
      categories
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
