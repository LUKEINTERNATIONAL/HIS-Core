<template>
  <div style="padding: .1rem;">
    <ion-grid>
      <ion-row style="border: 1px solid #a5a5a599">
        <ion-col v-for="(item, index) in computedItems" :key="index" :size="4">
          <ion-list>
            <ion-item v-for="option in item" :key="option.label">
              <div :style="{width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '11px'}">
                <span><b>{{ option.label }}: </b></span>
                <span><a>{{ option.value }}</a></span>
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
  setup (props) {
    const computedItems = computed(() => {
      const result = []
      const arr = props.items
      for (let i = 3; i > 0; i--) {
        result.push(arr.splice(0, Math.ceil(props.items.length / i)));
     }
     return result;
    })
    return {
      computedItems
    }
  } 
});
</script>