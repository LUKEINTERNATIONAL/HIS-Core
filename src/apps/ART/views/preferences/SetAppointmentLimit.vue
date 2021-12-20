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
      ART_GLOBAL_PROP.setAppointmentLimit(`${formData.property.value}`.toUpperCase())
        .then(() => toastSuccess("Property set"))
        .then(() => this.$router.push("/"));
    },
    getFields() {
      return [
        {
          id: "property",
          helpText: "Enter Appointment Limit",
          type: FieldType.TT_NUMBER,
          defaultValue: () => this.presetAppointmentLimit,
          validation: (val: any) => Validation.required(val),
        },
      ];
    },
  },
  data() {
    return {
      fields: [] as any,
      presetAppointmentLimit: '',
    };
  },
  watch: {
    $route: {
      async handler() {
        this.presetAppointmentLimit = await ART_GLOBAL_PROP.appointmentLimit();
        this.fields = this.getFields() 
      },
      deep: true,
      immediate: true,
    },
  },
});
</script>

