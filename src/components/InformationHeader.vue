<template>
  <div style="padding: .1rem;">
    <ion-grid>
      <ion-row style="border: 1px solid #a5a5a599">
        <ion-col v-for="(item, index) in computedItems" :key="index" :size="grid[numberOfColumns]">
          <ion-list>
            <ion-item v-for="option in item" :key="option.label" style="padding: 0 !important; margin: 0 !important;">
              <div :style="{width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '11px', margin: 0, padding: 0}">
                <span>{{ option.label }}: </span>
                <span v-if="option.other && option.other.editable" @click="onClick(option)">
                  <a><b>{{ option.value }}</b></a>
                </span>
                <span v-else><b>{{ option.value || 'N/A'}}</b></span>
              </div>
            </ion-item>
          </ion-list>
        </ion-col>
      </ion-row>
    </ion-grid>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { Option } from "@/components/Forms/FieldInterface";
import { IonGrid, IonRow, IonCol } from "@ionic/vue";
import { chunk } from "lodash";
export default defineComponent({
  name: "HisResultCard",
  components: {
    IonGrid,
    IonRow,
    IonCol,
  },
  props: {
    icon: {
      required: false,
    },
    items: {
      type: Object as PropType<Option[]>,
      required: true,
    },
    numberOfColumns: {
      type: Number,
      default: 2
    },
  },
  emits: ['update', 'addGuardian'],
  setup (props, { emit }) {
    const grid: Record<number, number> = {1:12, 2:6, 3:4, 4:3}
    const computedItems = computed(() => 
      chunk(props.items, Math.ceil(props.items.length / props.numberOfColumns))
    )
    const onClick = (entry: Option) => {
      if (entry.other.category === 'demographics') {
        return emit('update', entry.other.attribute)
      }
      return emit('addGuardian')
    }

    return {
      computedItems,
      onClick,
      grid,
    }
  } 
});
</script>
<style scoped>
ion-item {
  padding: 1px !important;
}
</style>