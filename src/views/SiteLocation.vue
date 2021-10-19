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
import { LocationService } from "@/services/location_service";
import { Option } from "@/components/Forms/FieldInterface";
import Validation from "@/components/Forms/validations/StandardValidations";
export default defineComponent({
  components: { HisStandardForm },
  methods: {
    onFinish(formData: any) {
      const siteLocation = formData.location.value;
      GlobalPropertyService.set(this.property, siteLocation)
        .then(() => toastSuccess("Property set"))
        .then(() => this.$router.push("/"));
    },
    async getFields() {
      this.fields = [
        {
          id: "location",
          helpText: "Please select facility name",
          type: FieldType.TT_SELECT,
          config: {
            showKeyboard: true,
            isFilterDataViaApi: true,
          },
          validation: (val: any) => Validation.required(val),
          options: (_: any, filter = "") => this.getFacilities(filter),
        },
      ];
    },
    async getFacilities(filter = ""): Promise<Option[]> {
      const facilities = await LocationService.getFacilities({ name: filter });
      return facilities.map((facility: any) => ({
        label: facility.name,
        value: facility.location_id,
        other: {
          id: facility.location_id,
        },
      }));
    },
  },
  data() {
    return {
      val: '',
      fields: [] as any,
      property: "current_health_center_id",
    };
  },
  watch: {
    $route: {
      async handler() {
        this.val = await GlobalPropertyService.get(this.property);
        this.getFields();
      },
      deep: true,
      immediate: true,
    },
  },
});
</script>

