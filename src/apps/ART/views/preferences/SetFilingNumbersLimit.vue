<template>
  <his-standard-form
    :fields="fields"
    @onFinish="onFinish"
    :skipSummary="true"
  />
</template> 
<script lang="ts">
import { defineComponent } from "vue";
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { GlobalPropertyService } from "@/services/global_property_service";
import { toastSuccess } from "@/utils/Alerts";
import Validation from "@/components/Forms/validations/StandardValidations"

export default defineComponent({
  components: { HisStandardForm },
  methods: {
    onFinish(formData: any) {
      const property = `${formData.property.value}`.toUpperCase();
      GlobalPropertyService.set(this.property, property)
        .then(() => toastSuccess("Property set"))
        .then(() => this.$router.push("/"));
    },
    getFields() {
      return [
        {
          id: "property",
          helpText: "Enter Filing Number Limit",
          preset: {
            label: this.presetFilingNumberLimit,
            value: this.presetFilingNumberLimit,
          },
          type: FieldType.TT_TEXT,
          validation: (val: any) => Validation.required(val),
        },
      ];
    },
  },
  data() {
    return {
      fields: [] as any,
      presetFilingNumberLimit: '',
      property: "filing.number.limit",
    };
  },
  watch: {
    $route: {
      async handler() {
        this.presetFilingNumberLimit = await GlobalPropertyService.get(this.property);
        this.fields = this.getFields() 
      },
      deep: true,
      immediate: true,
    },
  },
});
</script>