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
import { getFacilities } from "@/utils/HisFormHelpers/LocationFieldOptions";

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
    getFacilities(filter = "") {
      return getFacilities(filter);
    },
    getFields(): any {
      return [
        {
          id: "offer_via",
          helpText: "Offer VIA",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => this.yesNoOptions(),
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
              "Suspected Cancer",
            ]);
          },
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
        },
        {
          id: "location",
          helpText: "CD4 Location",
          type: FieldType.TT_SELECT,
          // computedValue: ({ label }: Option) => ({
          //     tag: 'staging',
          //     obs: this.staging.buildValueText('Cd4 count location', label)
          // }),
          validation: (val: any) => Validation.required(val),
          options: (_: any, filter = "") => this.getFacilities(filter),
          config: {
            showKeyboard: true,
            isFilterDataViaApi: true,
          },
        },
      ];
    },
  },
});
</script>