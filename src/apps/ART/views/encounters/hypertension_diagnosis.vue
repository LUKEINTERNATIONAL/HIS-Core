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
import { FastTrackService } from "@/apps/ART/services/fast_track_service";
import { toastSuccess, toastWarning } from "@/utils/Alerts";
import { generateDateFields } from "@/utils/HisFormHelpers/MultiFieldDateHelper"

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  data: () => ({
    fields: [] as any,
    fastTrack: {} as any,
    options: [] as any,
    values: [] as any,
    gender: null as any,
  }),
  watch: {
    patient: {
      async handler(patient: any) {
        this.init(patient);
      },
      immediate: true,
    },
  },
  methods: {
    async onFinish(formData: any, computedData: any) {
      const encounter = await this.fastTrack.createEncounter();
	const date = computedData.session_date
      if (encounter) {
        const obs = await this.buildObs(formData);
        const observations = await this.fastTrack.saveObservationList(obs);
        if (!observations)
          return toastWarning("Unable to save patient observations");

        toastSuccess("Observations and encounter created!");
        this.nextTask();
      } else {
        return toastWarning("Unable to create fast track encounter");
      }
    },
    async init(patient: any) {
      this.gender = patient.getGender();
      this.fields = this.getFields();
    },
    async buildObs(formData: any) {
      const observations = [];
      observations.push(
        await this.fastTrack.buildValueCoded(
          "Assess for fast track",
          formData.ft_assessment.value
        )
      );
      if (formData.ft_questions) {
        await formData.ft_questions.forEach(async (element: any) => {
          observations.push(
            await this.fastTrack.buildValueCoded(element.label, element.value)
          );
        });

        observations.push(
          await this.fastTrack.buildValueCoded(
            "Fast track",
            formData.book_client.value
          )
        );
      }
      return observations;
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
      return [
        {
          id: "has_hypertension",
          helpText: "Does the patient have hypertension",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => this.getYesNo(),
        },
        generateDateFields({
            id: 'hypertension_diagnosis',
            helpText: 'Date the patient was diagnosed with hypertension',
            required: true,
            estimation: {
                allowUnknown: false
            },
            computeValue: (date: string) => date,
        }, '')
      ];
    },
  },
});
</script>