<template>
  <his-standard-form
    :fields="fields"
    @onFinish="onFinish"
    :skipSummary="true"
    :cancelDestinationPath="cancelDestination"
    :activeField="fieldComponent" 
  >
  </his-standard-form>
</template> 
<script lang="ts">
import { defineComponent } from "vue";
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations";
import EncounterMixinVue from "./EncounterMixin.vue";
import { ConsultationService } from "@/apps/ART/services/consultation_service";
import { toastSuccess, toastWarning } from "@/utils/Alerts";
import { generateDateFields } from "@/utils/HisFormHelpers/MultiFieldDateHelper";
import { ObservationService } from "@/services/observation_service";

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  data: () => ({
    fields: [] as any,
    consultation: {} as any,
    options: [] as any,
    values: [] as any,
    gender: null as any,
    activeField: '' as string,
  }),
  watch: {
    ready: {
      handler(ready: boolean) {
        if (ready) this.init();
      },
      immediate: true,
    },
  },
  methods: {
    async onFinish(formData: any, computedData: any) {
      const encounter = await this.consultation.createEncounter();
      const val = formData.has_hypertension.value;
      if (encounter) {
        const enc = [];
        const hyperTensionOb = await ObservationService.buildValueCoded(
          "Patient has hypertension",
          formData.has_hypertension.value
        );
        enc.push(hyperTensionOb);
        if (val === "Yes") {
          const date = computedData.hypertension_diagnosis;
          const dateOb = await ObservationService.buildValueDate(
            "Hypertension diagnosis date",
            date
          );
          enc.push(dateOb);
        }
        const observations = await this.consultation.saveObservationList(enc);

        if (!observations) return toastWarning("Unable to save patient observations")
        toastSuccess("Observations and encounter created!");
        this.$router.back()
      } else {
        return toastWarning("Unable to create consultation encounter");
      }
    },
    async init() {
      this.consultation = new ConsultationService(
        this.patientID,
        this.providerID
      );
      this.fields = this.getFields();
    },
    getYesNo() {
      return [
        {
          label: "yes",
          value: "Yes",
        },
        {
          label: "no",
          value: "No",
        },
      ];
    },
    getFields(): any {
      const f = [
        {
          id: "has_hypertension",
          helpText: "Does the patient have hypertension",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => this.getYesNo(),
        },
        ...generateDateFields(
          {
            condition: (f: any) => f.has_hypertension.value === 'Yes',
            id: "hypertension_diagnosis",
            helpText: "Date the patient was diagnosed with hypertension",
            required: true,
            estimation: {
              allowUnknown: false,
            },
            computeValue: (date: string) => date,
          },
          ""
        ),
      ];
      return f;
    },
  },
});
</script>