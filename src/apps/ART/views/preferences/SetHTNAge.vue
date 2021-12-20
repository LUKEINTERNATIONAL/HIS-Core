
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
import { toastSuccess } from "@/utils/Alerts";
import Validation from "@/components/Forms/validations/StandardValidations"
import ART_GLOBAL_PROP from "@/apps/ART/art_global_props"

export default defineComponent({
  components: { HisStandardForm },
  methods: {
    onFinish(formData: any) {
      ART_GLOBAL_PROP.setHtnAgeThreshold(`${formData.htn_age.value}`.toUpperCase())
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
      htnThreshold: ''
    };
  },
  watch: {
    $route: {
      async handler() {
        this.htnThreshold = await ART_GLOBAL_PROP.htnAgeThreshold()
        this.getFields();
      },
      deep: true,
      immediate: true,
    },
  },
});
</script>

