<template>
  <his-standard-form
    :fields="fields"
    :activeField="activeField"
    :onFinishAction="onFinish"
    :skipSummary="true"
    :cancelDestinationPath="cancelDestination"
  >
  </his-standard-form>
</template> 
<script lang="ts">
import { defineComponent } from "vue";
import { Field, Option } from "@/components/Forms/FieldInterface";
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations";
import HisApp from "@/apps/app_lib";
import { finalList } from "./stock_service";

export default defineComponent({
  components: { HisStandardForm },
  data: () => ({
    activeField: "",
    fields: [] as any,
    drugs: [] as any,
    selectedDrugs: [] as any
  }),

  methods: {
    async onFinish(formData: any, computedData: any) {
      //
    },
    getFields(): Array<Field> {
      return [
        {
          id: "barcode",
          helpText: "Scan barcode",
          type: FieldType.TT_BARCODE,
        },
        {
          id: "select drugs",
          helpText: "Select drugs",
          type: FieldType.TT_MULTIPLE_SELECT,
          requireNext: true,
          validation: (val: any) => Validation.required(val),
          options: () => this.drugs,
          unload: (val: any) => this.selectedDrugs = val
        },
        {
          id: "date",
          helpText: "Set date",
          type: FieldType.TT_FULL_DATE,
        },
        {
          id: "enter_batches",
          helpText: "Batch entry",
          type: FieldType.TT_BATCH_ENTRY,
          options: () => this.selectedDrugs,
        },
      ];
    },
    selectAll(listData: Array<Option>) {
      return listData.map((l) => {
        l.isChecked = true;
        return l;
      });
    },
    formatDrugs() {
      return finalList.map((drug) => {
        return {
          label: drug.shortName,
          value: drug,
        };
      });
    },
  },
  created() {
    this.fields = this.getFields();
    this.drugs = this.formatDrugs();
  },
});
</script>