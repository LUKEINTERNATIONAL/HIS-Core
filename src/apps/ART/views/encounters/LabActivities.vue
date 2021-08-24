<template>
  <his-standard-form
    :fields="fields"
    @onFinish="onFinish"
    :skipSummary="true"
    :cancelDestinationPath="cancelDestination">
  </his-standard-form>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import EncounterMixinVue from "./EncounterMixin.vue";
import { isEmpty } from "lodash";
import { OrderService } from "@/services/order_service";

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  data: () => ({
    fields: [] as any,
    fieldContext: {} as any,
  }),
  watch: {
    ready: {
        handler(ready: boolean) {
            if (ready) {
                this.fields = this.getFields() 
            }
        }
    }
  },
  methods: {
    onFinish() {
        this.nextTask()
    },
    getFields(): any {
      return [
        {
          id: "patient_lab_orders",
          helpText: "Lab orders",
          type: FieldType.TT_LAB_ORDERS,
          onload: (fieldContext: any) => {
            this.fieldContext = fieldContext
          },
          options: async () => {
            const orders = await OrderService.getOrders(this.patientID);
            const VLOrders = OrderService.formatLabs(orders);
            return [
              {
                label: "Lab orders",
                value: "order trail",
                other: {
                  values: VLOrders,
                }
              }
            ]
          },
          config: {
            hiddenFooterBtns: ["Clear"],
            footerBtns: [
              {
                name: "Order",
                size: "large",
                slot: "end",
                color: "primary",
                visible: true,
                onClick: async () => {
                  if (!isEmpty(this.fieldContext)) {
                    await this.fieldContext.launchOrderSelection()
                  }
                },
                visibleOnStateChange: (state: Record<string, any>) => {
                  return state.index === 0;
                }
              }
            ]
          }
        }
      ]
    }
  }
});
</script>
