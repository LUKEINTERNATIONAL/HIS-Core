
<template>
  <his-standard-form
    :fields="fields"
    :onFinishAction="onFinish"
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
      const sitePrefix = `${formData.htn_age.value}`.toUpperCase();
      GlobalPropertyService.set(this.property, sitePrefix)
        .then(() => toastSuccess("Property set"))
        .then(() => this.$router.push("/"));
    },
    async getFields() {
      this.fields = [
        {
          id: "htn_age",
          helpText: "Enter HTN age Threshold",
          preset: {
            label: this.htnThreshold,
            value: this.htnThreshold,
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
      property: "htn.screening.age.threshold",
      htnThreshold: ''
    };
  },
  watch: {
    $route: {
      async handler() {
        this.htnThreshold = await GlobalPropertyService.get(this.property);
        this.getFields();
      },
      deep: true,
      immediate: true,
    },
  },
});
</script>

