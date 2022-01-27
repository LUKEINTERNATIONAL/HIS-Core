<template>
  <his-standard-form
    :fields="fields"
    :onFinishAction="onFinish"
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
import PersonField from "@/utils/HisFormHelpers/PersonFieldHelper";
import { Field } from "@/components/Forms/FieldInterface";

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  data: () => ({
    patientType: {} as any,
  }),
  watch: {
    patient: {
      async handler() {
        this.patientType = new PatientTypeService(
          this.patientID,
          this.providerID
        );
        await this.patientType.loadPatientType();
        this.fields = this.getFields();
      },
      deep: true,
    },
  },
  methods: {
    async onFinish(formData: any) {
//       const encounter = await this.patientType.createEncounter();

//       if (!encounter) return toastWarning("Unable to create encounter");

//       this.patientType.setLocationName(formData?.location?.label);
//       this.patientType.setPatientType(formData?.patient_type?.value);

//       await this.patientType.save();
//       toastSuccess("Observations and encounter created!");
//       this.nextTask();
    },
    
    getFields(): any {
      return [
        {
          id: "reason_for_visit",
          helpText: "Reason for visit",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => [
            {
              label: "Initial screening",
              value: "Initial screening",
            },
            {
              label: "Postponed treatmment",
              value: "Postponed treatment",
            },
            {
              label: "One year subsequent check-up after treatmen",
              value: "One year subsequent check-up after treatmen",
            },
            {
              label: "Subsequent screening",
              value: "Subsequent screening",
            },
            {
              label: "Problem visit after treatment",
              value: "Problem visit after treatment",
            },
            {
              label: "Referral",
              value: "Referral",
            },
          ],
          // unload: async (value: any) => {
          //   this.obs.push(
          //     this.socialHistory.buildValueCoded("SMOKE_HIS", value.value)
          //   );
          // },
        },
      ];
    },
  },
});
</script>