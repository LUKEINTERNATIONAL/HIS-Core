<template>
  <div class="center">
    <p class="text">
      {{ value }}
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import FieldMixinVue from "./FieldMixin.vue";

export default defineComponent({
  mixins: [FieldMixinVue],
  data: () => ({
    value: "",
  }),
  async activated() {
    const data = await this.options();
    this.value = data[0].value;
  },
});
</script>
<style scoped>
.center {
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
}
.text {
  font-size: 2rem;
}
</style>