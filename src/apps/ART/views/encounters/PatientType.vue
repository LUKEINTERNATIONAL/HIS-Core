<template>
  <his-standard-form
    :fields="fields"
    @onFinish="onFinish"
    :skipSummary="true"
    :cancelDestinationPath="cancelDestination"
  >
  </his-standard-form>
</template> 
<script lang="ts">
import { defineComponent } from "vue";
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations";
import EncounterMixinVue from "./EncounterMixin.vue";
import { PatientTypeService } from "@/apps/ART/services/patient_type_service";
import { toastSuccess, toastWarning } from "@/utils/Alerts";

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  data: () => ({
    patientType: {} as any,
  }),
  watch: {
    patient: {
      async handler() {
        this.patientType = new PatientTypeService(this.patientID, this.providerID);
        await this.patientType.loadPatientType()
        this.fields = this.getFields();
      },
      deep: true
    },
  },
  methods: {
    async onFinish(formData: any) {
      const encounter = await this.patientType.createEncounter();

      if (!encounter) return toastWarning("Unable to create encounter");

      const obs = await this.patientType.savePatientType(formData.patient_type.value)

      if (!obs) return toastWarning("Unable to save patient observations");

      toastSuccess("Observations and encounter created!");

      this.nextTask();
    },
    getFields(): any {
      return [
        {
          id: "patient_type",
          helpText: `Current type: ${this.patientType.getType()}`,
          type: FieldType.TT_SELECT,
          validation: (val: any) =>
            Validation.required(val) ||
            Validation.notTheSame(val, this.patientType.getType()),
          options: () => [
            {
              label: "New patient",
              value: "New patient",
            },
            {
              label: "External consultation",
              value: "External consultation",
            },
          ],
        },
      ];
    },
  },
});
</script>
