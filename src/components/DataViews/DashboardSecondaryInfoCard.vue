<template>
  <tool-bar-medium-card>
    <ul :style="{marginLeft: '-4%'}">
      <li v-for="(item, index) in items" :key="index"> 
      <ion-icon v-if="hasIcon(item)" :icon="item.other.icon"/>
      {{ item.label }}: <b>{{ item.value }}</b>
      </li>
    </ul>
  </tool-bar-medium-card>
</template>
<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Option } from "@/components/Forms/FieldInterface";
import {IonIcon} from "@ionic/vue"
import ToolBarMediumCard from "@/components/Cards/ToolbarMediumCard.vue"
export default defineComponent({
  name: "HisResultCard",
  components: {ToolBarMediumCard, IonIcon},
  props: {
    icon: {
      required: false,
    },
    items: {
      type: Object as PropType<Option[]>,
      required: true,
    },
  },
  methods: {
    hasIcon(item: Option) {
      return 'other' in item && 'icon' in item.other
    }
  }
});
</script>
<style scoped>
  b {
    color: rgb(71, 70, 70);
  }
  ul li {
    list-style: none;
    color: rgb(94, 92, 92);
  }
</style>