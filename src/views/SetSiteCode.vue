
<template>
  <his-standard-form
    :fields="fields"
    @onSubmit="onSubmit"
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

export default defineComponent({
  components: { HisStandardForm },
  methods: {
    onFinish(formData: any) {
      const sitePrefix = `${formData.site_code.value}`.toUpperCase();
      GlobalPropertyService.set(this.property, sitePrefix)
        .then(() => toastSuccess("Property set"))
        .then(() => this.$router.push("/"));
    },
    async setFields() {
      const val = await GlobalPropertyService.get("site_prefix");
      this.fields = [
        {
          id: "site_code",
          helpText: "Enter Site Code",
          defaultValue: () => val,
          type: FieldType.TT_TEXT,
          validation(value: any): null | Array<string> {
            return !value ? ["Value is required"] : null;
          },
        },
      ];
    },
  },
  data() {
    return {
      fields: [] as any,
      property: "site_prefix",
    };
  },
  watch: {
    $route: {
      async handler({ query }: any) {
        this.setFields();
      },
      deep: true,
      immediate: true,
    },
  },
});
</script>

