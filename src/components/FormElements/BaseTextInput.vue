<template>
  <ion-input
    ref="input"
    class="input_display"
    v-model="text"
    :type="type"
    :disabled="disabled"
    :readonly="isReadOnly"
    autocapitalize="sentences"
  />
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { IonInput, isPlatform } from "@ionic/vue";

export default defineComponent({
  name: "HisInput",
  components: { IonInput },
  data:() => ({
    isReadOnly: false as boolean,
    text: '' as string | number
  }),
  created() {
    this.isReadOnly = !isPlatform('desktop')
  },
  watch: {
    value(val: number | string) {
      this.text = val
    },
    text(text: string | number) {
      this.$emit('onValue', text)
    }
  },
  props: {
    value: {
      required: false,
    },
    type: {
      type: String,
      default: () => "text",
    },
    disabled: {
      type: Boolean,
      default: () => false,
    }
  },
});
</script>
<style scoped>
.input_display {
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom: 1px solid silver;
  width: 99.5%;
  font-family: "Nimbus Sans L","Arial Narrow",sans-serif;
  font-size: 2.2em;
  background: none;
  padding-left: 5px;
}
</style>