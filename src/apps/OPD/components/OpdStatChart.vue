<template>
  <apexchart 
    width="100%"
    height="350px"
    type="bar"
    :options="options"
    :series="series"
  />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  props: {
    categories: Array,
    series: Array
  },
  setup(props) {
    const options = ref({
      chart: {
        height: 'auto'
      },
      title: {
        text: 'New registered , Returning and Referred clients',
        margin: 20,
        align: 'center',
        style: {
          fontWeight: 'regular'
        }
      },
      subtitle: {
        text: 'For the past 12 months',
        align: 'center',
        margin: 10,
      },
      xaxis: {
        categories: props.categories
      },
      yaxis: {
        min: 0,
        forceNiceScale: true,
        title: {
          text: 'Number of clients'
        }
      },
    })

    return {
      options,
    }
  }
})
</script>
