<template>
  <his-standard-form
    :fields="fields"
    :onFinishAction="onFinish"
    :skipSummary="false"
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
import { SocialHistoryService } from "@/apps/ART/services/social_history_service";
import { toastSuccess, toastWarning } from "@/utils/Alerts";
import { generateDateFields } from "@/utils/HisFormHelpers/MultiFieldDateHelper";

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  data: () => ({
    socialHistory: {} as any,
    obs: [] as any,
  }),
  watch: {
    patient: {
      async handler() {
        this.socialHistory = new SocialHistoryService(
          this.patientID,
          this.providerID
        );
        this.fields = await this.getFields();
      },
      deep: true,
    },
  },
  methods: {
    async onFinish(formData: any) {
      const encounter = await this.socialHistory.createEncounter();

      if (!encounter) return toastWarning("Unable to create encounter");

      const data = await Promise.all([...this.obs]);
      const obs = await this.socialHistory.saveObservationList(data);

      if (!obs) return toastWarning("Unable to save patient observations");

      toastSuccess("Observations and encounter created!");

      this.nextTask();
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
          unload: async (value: any) => {
            this.obs.push(
              this.socialHistory.buildValueCoded("SMOKE_HIS", value.value)
            );
          },
        },
        {
          id: "hiv_status",
          helpText: "HIV status",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          condition(formData: any) {
            //check current HIV status
            return true;
          },
          options: () => [
            {
              label: "Positive on ART",
              value: "Positive on ART",
            },
            {
              label: "Positive Not on ART",
              value: "Positive Not on ART",
            },
            {
              label: "Negative",
              value: "Negative",
            },
            {
              label: "Never tested",
              value: "Never tested",
            },
            {
              label: "Prefers Not to disclose",
              value: "Prefers Not to disclose",
            },
          ],
          //   unload: async (value: any) => {
          //     this.obs.push(this.socialHistory.buildValueText('Smoking duration', value.value));
          //   }
        },
        ...generateDateFields(
          {
            id: "hiv_test_date",
            helpText: "HIV test result date",
            required: true,
            minDate: () => this.patient.getBirthdate(),
            maxDate: () => this.socialHistory.getDate(),
            estimation: {
              allowUnknown: false,
            },
            computeValue: (date: string, isEstimate: boolean) => {
              return {
                date,
                tag: "cxca screening",
                isEstimate,
                obs: this.socialHistory.buildValueDate("HIV test date", date),
              };
            },
          },
          this.socialHistory.getDate()
        ),
        {
          id: "offer_screening",
          helpText: "Offer CxCa screening today",
          type: FieldType.TT_MULTIPLE_YES_NO,
          validation: (val: any) =>
            Validation.required(val) || Validation.anyEmpty(val),
          //   computedValue: (d: Array<Option>) => {
          //     return {
          //       tag: 'obs',
          //       obs: d.map(({ other, value }: Option) => this.reception.buildValueCoded(other.concept, value))
          //     }
          //   },
          options: (form: any) => {
            if (form.who_is_present) return form.who_is_present;
            return [
              {
                label: "Offer CxCa screening?",
                value: "",
                other: {
                  concept: "Patient Present",
                  property: "patient_present",
                  values: this.yesNoOptions(),
                },
              },
            ];
          },
        },
        {
          id: "results_available",
          helpText: "Results available",
          type: FieldType.TT_MULTIPLE_YES_NO,
          validation: (val: any) =>
            Validation.required(val) || Validation.anyEmpty(val),
          //   computedValue: (d: Array<Option>) => {
          //     return {
          //       tag: 'obs',
          //       obs: d.map(({ other, value }: Option) => this.reception.buildValueCoded(other.concept, value))
          //     }
          //   },
          options: (form: any) => {
            if (form.who_is_present) return form.who_is_present;
            return [
              {
                label: "Offer CxCa screening?",
                value: "",
                other: {
                  concept: "Patient Present",
                  property: "patient_present",
                  values: this.yesNoOptions(),
                },
              },
            ];
          },
        },
        ...generateDateFields(
          {
            id: "cxca_date",
            helpText: "Previous CxCa test year",
            required: true,
            minDate: () => this.patient.getBirthdate(),
            maxDate: () => this.socialHistory.getDate(),
            estimation: {
              allowUnknown: false,
            },
            computeValue: (date: string, isEstimate: boolean) => {
              return {
                date,
                tag: "cxca screening",
                isEstimate,
                obs: this.socialHistory.buildValueDate("cxca test date", date),
              };
            },
          },
          this.socialHistory.getDate()
        ),
        {
          id: "previous_screening_method",
          helpText: "Previous screening method",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          //   condition(formData: any) {
          //     return formData.smoking_history.value === "Yes"
          //   },
          options: () => [
            {
              label: "VIA",
              value: "VIA",
            },
            {
              label: "PAP Smear",
              value: "PAP Smear",
            },
            {
              label: "HPV DNA",
              value: "HPV DNA",
            },
            {
              label: "Speculum Exam",
              value: "Speculum Exam",
            },
          ],
          //   unload: async (value: any) => {
          //     this.obs.push(this.socialHistory.buildValueText('Smoking duration', value.value));
          //   }
        },
        {
          id: "waiting_for_lab_tests",
          helpText: "Screening method being offered today",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          //   computedValue: (d: Array<Option>) => {
          //     return {
          //       tag: 'obs',
          //       obs: d.map(({ other, value }: Option) => this.reception.buildValueCoded(other.concept, value))
          //     }
          //   },
          options: (form: any) => this.yesNoOptions(),
        },
        {
          id: "current_smoker",
          helpText: "Do you still smoke?",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          condition(formData: any) {
            return formData.smoking_history.value === "Yes";
          },
          options: () => [
            {
              label: "Yes",
              value: "Yes",
            },
            {
              label: "No",
              value: "No",
            },
          ],
          unload: async (value: any) => {
            this.obs.push(
              this.socialHistory.buildValueCoded("Current smoker", value.value)
            );
          },
        },
        {
          id: "reason_for_no_cxca",
          helpText: "Reason for NOT offering CxCa screening",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => [
            {
              label: "Client prefered counselling",
              value: "Client prefered counselling",
            },
            {
              label: "Not applicable",
              value: "Not applicable",
            },
          ],
          unload: async (value: any) => {
            this.obs.push(
              this.socialHistory.buildValueCoded(
                "Does the patient drink alcohol?",
                value.value
              )
            );
          },
        },
      ];
    },
  },
});
</script>