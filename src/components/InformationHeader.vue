<template>
  <div style="padding: .1rem;">
    <ion-grid>
      <ion-row style="border: 1px solid #a5a5a599">
        <ion-col v-for="(item, index) in computedItems" :key="index" :size="4">
          <ion-list>
            <ion-item v-for="option in item" :key="option.label">
              <div :style="{width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '11px'}">
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
  },
  emits: ['update', 'addGuardian'],
  setup (props, { emit }) {
    const computedItems = computed(() => chunk(props.items, Math.ceil(props.items.length / 3)))
    const onClick = (entry: Option) => {
      if (entry.other.category === 'demographics') {
        return emit('update', entry.other.attribute)
      }
      return emit('addGuardian')
    }

    return {
      computedItems,
      onClick
    }
  } 
});
</script>
<style scoped>
ion-item {
  padding: 1px !important;
}
</style>