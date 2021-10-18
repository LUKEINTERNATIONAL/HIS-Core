
<template>
  <his-standard-form
    :fields="fields"
    @onFinish="onFinish"
    :skipSummary="true"
    v-if="fields.length > 0"
  />
</template> 
<script lang="ts">
import { defineComponent } from "vue";
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { GlobalPropertyService } from "@/services/global_property_service";
import { toastSuccess, toastWarning } from "@/utils/Alerts";
import Validation from "@/components/Forms/validations/StandardValidations"
import { isEmpty } from "lodash"

export default defineComponent({
  components: { HisStandardForm },
  methods: {
    onFinish(formData: any) {
      const children = formData.children.map((data: { label: any }) => {
        return data.label
      }).join(); 
      const adults = formData.adults.map((data: { label: any }) => {
        return data.label
      }).join();
      GlobalPropertyService.set('clinic.days', adults)
        .then(() => GlobalPropertyService.set('peads.clinic.days', children))
        .then(() => toastSuccess('Property Set'))
        .then(() => this.$router.push("/"))
        .catch(() => toastWarning('Could not set property'))
    },
    async getClinicDayOptions(property: string) {
      const val = await GlobalPropertyService.get(property);
      return this.days.map((day) => ({
        label: day,
        value: day,
        isChecked: !isEmpty(val) && val.search(day) >= 0
      }))
    },
    getFields() {
      return [
        {
          id: "adults",
          helpText: "Clinic days (adults: 18 yrs and over)",
          type: FieldType.TT_MULTIPLE_SELECT,
          validation: (val: any) => Validation.required(val),
          options:()=> this.getClinicDayOptions('clinic.days'),
        },
        {
          id: "children",
          helpText: "Clinic days (children: Under 18 yrs)",
          type: FieldType.TT_MULTIPLE_SELECT,
          validation: (val: any) => Validation.required(val),
          options:()=> this.getClinicDayOptions('peads.clinic.days'),
        }
      ];
    },
  },
  data() {
    return {
      fields: [] as any,
      property: "site_prefix",
      days: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ]
    };
  },
  watch: {
    $route: {
      async handler() {
        this.fields = this.getFields();
      },
      deep: true,
      immediate: true,
    },
  },
});
</script>

