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
import {ScreeningResultService} from "@/apps/CxCa/services/CxCaScreeningResultService"
import { toastSuccess, toastWarning } from "@/utils/Alerts";
import { getFacilities } from "@/utils/HisFormHelpers/LocationFieldOptions";

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  data: () => ({
    screeningResult: {} as any,
    obs: [] as any,
    currentMethod: ''
  }),
  watch: {
    patient: {
      async handler() {
        this.screeningResult = new ScreeningResultService(
          this.patientID,
          this.providerID
        );
        this.currentMethod = await this.getTreatmentOptions(); 
        this.fields = this.getFields();
        
      },
      deep: true,
    },
  },
  methods: {
    async onFinish(formData: any) {
      const encounter = await this.screeningResult.createEncounter();
      if (!encounter) return toastWarning("Unable to create encounter");
      if(formData.treatment_option && formData.treatment_option.value === "Referral") {
        this.obs.push(this.screeningResult.buildValueText('Referral location', formData['location'].label))
      }
      const data = await Promise.all([...this.obs]);
      await this.screeningResult.saveObservationList(data);
      toastSuccess("Observations and encounter created!");
      this.nextTask();
    },
    getFacilities(filter = "") {
      return getFacilities(filter);
    },
    async getTreatmentOptions() {
      return await this.screeningResult.getFirstValueCoded('CxCa screening method');
    },
    getOptions(method: string) {
      if(method.match(/via/i)){
        return ["VIA Negative","VIA Positive","Suspect Cancer"];
      }else if(method.match(/smear/i)){
        return ["PAP Smear Normal","PAP Smear Abnormal"];
      }else if(method.match(/HPV DNA/i)){
        return ["HPV positive","HPV negative"];
      }else if(method.match(/Speculum/i)){
        return ["Visible Lesion","No visible Lesion","Other Gynae"];
      }
      return []
    },
    getFields(): any {
      return [
        {
          id: "screening_result",
          helpText: "Screening Result",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => this.mapOptions([...this.getOptions(this.currentMethod)]),
          unload: (data: any) => {
            this.obs.push(this.screeningResult.buildValueCoded('Patient went for VIA?', data.value))
          }
        },
        {
          id: "offer_via",
          helpText: "Offer VIA",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => this.yesNoOptions(),
          unload: (data: any) => {
            this.obs.push(this.screeningResult.buildValueCoded('Patient went for VIA?', data.value))
          },
          condition(formData: any) {
            return formData.screening_result.value === "VIA Positive";
          },
        },
        {
          id: "via_screening_results",
          helpText: "VIA screening results",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => {
            return this.mapOptions([
              "VIA negative",
              "VIA positive",
              "Suspect cancer",
            ]);
          },
          condition(formData: any) {
            return formData.offer_via.value === "Yes";
          },
          unload: (data: any) => {
            this.obs.push(this.screeningResult.buildValueCoded('VIA Results', data.value))
          }
        },
        {
          id: "reason_for_not_offering_via",
          helpText: "Reason for NOT offering VIA",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => {
            return this.mapOptions([
              "Client NOT ready",
              "Treatment not available",
              "Other conditions",
            ]);
          },
          condition(formData: any) {
            return formData.offer_via.value === "No";
          },
          unload: (data: any) => {
            this.obs.push(this.screeningResult.buildValueCoded('Other reason for not seeking services', data.value))
          }
        },
        {
          id: "treatment_option",
          helpText: "Enter treatment option",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => {
            return this.mapOptions([
              "Same day treatment",
              "Postponed treatment",
              "Referral",
            ]);
          },
          unload: (data: any) => {
            this.obs.push(this.screeningResult.buildValueCoded('Directly observed treatment option', data.value))
          }
        },
        {
          id: "postponed_reason",
          helpText: "Select reason for postponing treatment",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => {
            return this.mapOptions([
              "Client not ready",
              "Treatment not available",
              "Other conditions",
            ]);
          },
          condition(formData: any) {
            return formData.treatment_option.value === "Postponed treatment";
          },
          unload: (data: any) => {
            this.obs.push(this.screeningResult.buildValueCoded('Postponed reason', data.value))
          }
        },
        {
          id: "referral_rreason",
          helpText: "Referral reason",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => {
            return this.mapOptions([
              "Further Investigation and Management",
              "Large Lesion (Greater than 75 percent)",
              "Suspect cancer",
              "Unable to treaat client",
              "Treatment not available",
              "Other conditions",
            ]);
          },
          condition(formData: any) {
            return formData.treatment_option.value === "Referral";
          },
          unload: (data: any) => {
            this.obs.push(this.screeningResult.buildValueCoded('Referral reason', data.value))
          }
        },
        {
          id: "location",
          helpText: "Location reffered from",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: (_: any, filter = "") => this.getFacilities(filter),
          config: {
            showKeyboard: true,
            isFilterDataViaApi: true,
          },
          condition(formData: any) {
            return formData.treatment_option.value === "Referral";
          },
        },
      ];
    },
  },
});
</script>