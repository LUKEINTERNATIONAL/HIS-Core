<template>
    <div :class="`his-card ${state}`" @click="$emit('onclick')"> 
      <s v-if="!enabled">{{ label }}</s> 
      <div v-if="enabled">{{label}}</div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    color: {
        type: String
    },
    enabled: {
      type: Boolean,
      default: true
    },
    label: {
        type: String,
        required: true
    }
  },
  computed: {
    state(): string {
      return this.enabled ? `clickable ${this.color}` : 'disabled-card-color'
    }
  }
})
</script>
<style scoped>
 .his-card {
    height: 50px;
    margin: 1.4%;
    text-align: center;
 }
</style>
