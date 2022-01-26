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
import EncounterMixinVue from "../../../../views/EncounterMixin.vue";
import { AssessmentService } from "@/apps/CxCa/services/CxCaAssessmentService";
import { toastSuccess, toastWarning } from "@/utils/Alerts";
import { generateDateFields } from "@/utils/HisFormHelpers/MultiFieldDateHelper";
import { getFacilities } from "@/utils/HisFormHelpers/LocationFieldOptions";

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  data: () => ({
    assessment: {} as any,
    obs: [] as any,
    showHIVQuestions: true,
    offerCxCa: false
  }),
  watch: {
    patient: {
      async handler() {
        this.assessment = new AssessmentService(
          this.patientID,
          this.providerID
        );
        await this.hasHIVDetails();
        await this.setOfferCxCa();
        this.fields = await this.getFields();
      },
      deep: true,
    },
  },
  methods: {
    async onFinish(formData: any, computed: any) {
      const encounter = await this.assessment.createEncounter();

      if (!encounter) return toastWarning("Unable to create encounter");

      const data = await Promise.all([...this.obs, ]);

      const obs = await this.assessment.saveObservationList(data);

      if (!obs) return toastWarning("Unable to save patient observations");

      toastSuccess("Observations and encounter created!");

      this.nextTask();
    },
    hasHIVDetails() {
      return true
    },
    showResultsAvailable(formData: any) {
      //return true if had via before
      return true
    },
    async setOfferCxCa() {

      const data = await this.assessment.getFirstValueCoded('Offer CxCa');
      this.offerCxCa = data && data === "Yes";
      return true
    },
    enterPreviousCxCaData(formData: any) {
      const everHadCxCa = formData.ever_had_cxca.value === "Yes";
      const resultsAvailable = formData.results_available.value === "Yes";
      return everHadCxCa && resultsAvailable
    },
    getFacilities(filter = "") {
      return getFacilities(filter);
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
              label: "One year subsequent check-up after treatment",
              value: "One year subsequent check-up after treatment",
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
              this.assessment.buildValueCoded(
                "Reason for visit",
                value.value
              )
            );
          },
        },
        {
          id: "hiv_status",
          helpText: "HIV status",
          type: FieldType.TT_SELECT,
          condition: () => this.showHIVQuestions,
          validation: (val: any) => Validation.required(val),
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
          unload: async (value: any) => {
            this.obs.push(
              this.assessment.buildValueCoded("HIV status", value.value)
            );
          },
        },
        ...generateDateFields(
          {
            id: "hiv_test_date",
            helpText: "HIV test result date",
            required: true,
            condition: (formData: any) => formData.hiv_status.value.match(/Negative|ART/i),
            minDate: () => this.patient.getBirthdate(),
            maxDate: () => this.assessment.getDate(),
            estimation: {
              allowUnknown: false,
            },
            computeValue: (date: string, isEstimate: boolean) => {
              return {
                date,
                tag: "cxca screening",
                isEstimate,
                obs: this.assessment.buildValueDate("HIV test date", date),
              };
            },
          },
          this.assessment.getDate()
        ),
        {
          id: "ever_had_cxca",
          helpText: "Ever had CxCa screening",
          type: FieldType.TT_SELECT,
          condition: (formData: any) => formData.reason_for_visit.value !== "Initial screening",
          options: () => this.yesNoOptions(),
          validation: (val: any) => Validation.required(val),
          unload: async (value: any) => {
            this.obs.push(
              this.assessment.buildValueCoded(
                "Offer CxCa",
                value.value
              )
            );
          },
        },
        {
          id: "results_available",
          helpText: "Results available?",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          condition: (formData: any) => formData.reason_for_visit.value !== "Initial screening",
          options: () => this.yesNoOptions(),
        },
        {
          id: "location",
          helpText: "CxCa screening location",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: (_: any, filter = "") => this.getFacilities(filter),
          config: {
            showKeyboard: true,
            isFilterDataViaApi: true,
          },
          condition: (formData: any) => this.enterPreviousCxCaData(formData),
          unload: async (value: any) => {
            this.obs.push(
              this.assessment.buildValueText(
                "Previous CxCa location",
                value.value
              )
            );
          },
        },
        ...generateDateFields(
          {
            id: "cxca_date",
            helpText: "Previous CxCa test",
            required: true,
            minDate: () => this.patient.getBirthdate(),
            maxDate: () => this.assessment.getDate(),
            estimation: {
              allowUnknown: false,
            },
            condition: (formData: any) => this.enterPreviousCxCaData(formData),
            computeValue: (date: string, isEstimate: boolean) => {
              return {
                date,
                tag: "cxca screening",
                isEstimate,
                obs: this.assessment.buildValueDate("cxca test date", date),
              };
            },
          },
          this.assessment.getDate()
        ),
        {
          id: "previous_screening_method",
          helpText: "Previous screening method",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          condition: (formData: any) => this.enterPreviousCxCaData(formData),
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
          unload: async (value: any) => {
            this.obs.push(
              this.assessment.buildValueCoded(
                "Previous CxCa screening method",
                value.value
              )
            );
          },
        },
        {
          id: "offer_CxCa",
          helpText: "Offer CxCa screening today",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          condition: (formData: any) => !this.offerCxCa,
          options: () => this.yesNoOptions(),
          unload: async (value: any) => {
            this.obs.push(
              this.assessment.buildValueCoded(
                "Offer CxCa",
                value.value
              )
            );
          },
        },
        {
          id: "screening_method",
          helpText: "Screening method being offered",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          condition: (formData: any) => this.offerCxCa,
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
          unload: async (value: any) => {
            this.obs.push(
              this.assessment.buildValueCoded(
                "CxCa screening method",
                value.value
              )
            );
          },
        },
        {
          id: "waiting_for_lab_tests",
          helpText: "Waiting for lab results",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          condition: (formData: any) => !formData.screening_method.value.match(/VIA|EXAM/i),
          unload: async (value: any) => {
            this.obs.push(
              this.assessment.buildValueCoded(
                "Waiting for test results",
                value.value
              )
            );
          },
          options: () => this.yesNoOptions(),
        },
        {
          id: "reason_for_no_cxca",
          helpText: "Reason for NOT offering CxCa screening",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          condition: (formData: any) => !formData.screening_method.value.match(/VIA|EXAM/i),
          options: () => [
            {
              label: "Client preferred counselling",
              value: "Preferred counseling",
            },
            {
              label: "Not applicable",
              value: "Not applicable",
            },
          ],
          unload: async (value: any) => {
            this.obs.push(
              this.assessment.buildValueCoded(
                "Reason for NOT offering CxCa",
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