
<template>
  <component :is="component"></component>
</template>
<script lang="ts">
import { defineAsyncComponent, defineComponent, ref, computed } from "vue";
import { HIS_APP_COMPONENTS } from "@/utils/Preferences"
export default defineComponent({
  components: {
    ...HIS_APP_COMPONENTS
  },
  data() {
    return {
      component: null as any
    }
  },
  watch: {
    '$route': {
        handler({query}: any) {
          this.component = query.name
        },
        immediate: true,
        deep: true
    }
  }
});
</script>
