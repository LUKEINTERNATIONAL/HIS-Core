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
        <opd-stat-chart v-if="series"
          :series="series"
          :categories="categories"
        ></opd-stat-chart>
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { IonGrid, IonRow, IonCol } from "@ionic/vue";
import OpdStatCard from '@/apps/OPD/components/OpdStatCard.vue'
import OpdStatChart from '@/apps/OPD/components/OpdStatChart.vue'
import Strings from "@/apps/OPD/utils/Strings";
import ApiClient from '@/services/api_client'
import dayjs from 'dayjs';

export default defineComponent({
  components: {
    OpdStatCard,
    OpdStatChart,
    IonGrid, 
    IonRow, 
    IonCol
  },
  setup() {
    const patientSummaryStats = ref([
      {label: '', value: 0, color: ''}
    ])

    const categories = ref()
    const series = ref()

    const updatePatientSummaryStats = function (stats: any) {
      const statsKeys = Object.keys(stats)
      let total = 0
      patientSummaryStats.value = []
      
      statsKeys.forEach(key => {
        patientSummaryStats.value.push({
          label: Strings.capitalizeFirstLetter(key.toString().replace('_', ' ')),
          value: stats[key],
          color: 'lightyellow'
        })
        
        total += stats[key]
      })

      patientSummaryStats.value.push({
        label: 'Total',
        value: total,
        color: 'yellowgreen'
      })
    }

    const updateChart = function(chartData: any) {
      const seriesNames = Object.keys(chartData)
      const keys = Object.keys(chartData[seriesNames[0]])
      categories.value = []
      series.value = []

      for(const name in seriesNames) {
        const counts: number[] = []

        for (let i = 0; i < keys.length; i++){
          const date = chartData[seriesNames[name]][keys[i]].start_date
          const formattedDate = dayjs(date).format("MMM/YYYY")
          if (formattedDate !== categories.value[i]) categories.value.push(formattedDate)

          counts.push(chartData[seriesNames[name]][keys[i]].count)
        }

        series.value.push({
          name: Strings.capitalizeFirstLetter(seriesNames[name]),
          data: counts
        })
      }
    }

    const fetchDashboardStats = async function() {
      const response = await ApiClient.get(
        `dashboard_stats?date=${sessionStorage.sessionDate}&program_id=14`,
      );

      if (response && response.status == 200) {
        const data = await response.json();
        updatePatientSummaryStats(data.top)
        updateChart(data.down);
      }
    }
    
    onMounted(async function() {
      await fetchDashboardStats();
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
