<template>
  <his-standard-form
    :fields="fields"
    :activeField="activeField"
    :onFinishAction="onFinish"
    :skipSummary="true"
    :cancelDestinationPath="cancelDestination"
  >
  </his-standard-form>
</template> 
<script lang="ts">
import { defineComponent } from "vue";
import { Field, Option } from "@/components/Forms/FieldInterface"
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations";
import { ReceptionService } from "@/apps/ART/services/reception_service"
import { ProgramService } from "@/services/program_service";
import { toastWarning, toastSuccess } from "@/utils/Alerts"
import EncounterMixinVue from './EncounterMixin.vue'

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  data: () => ({
    reception: {} as any,
    activeField: "",
    hasARVNumber: true,
    suggestedNumber: "" as any,
  }),
  watch: {
    patient: {
      async handler(patient: any) {
        this.reception = new ReceptionService(patient.getID(), this.providerID)

        await this.reception.loadSitePrefix()

        const ARVNumber = patient.getPatientIdentifier(4);
  
        if (ARVNumber === "") {
          this.hasARVNumber = false;

          const j = await ProgramService.getNextSuggestedARVNumber();
          this.suggestedNumber = j.arv_number.replace(/^\D+/g, "");
        }
        this.fields = this.getFields();
      },
      deep: true
    },
  },
  methods: {
    async onFinish(formData: any, computedData: any) {
      const encounter = await this.reception.createEncounter()

      if (!encounter) return toastWarning('Unable to create encounter')

      const registrationObs = await this.resolveObs(computedData, 'obs')

      const obs = await this.reception.saveObservationList(registrationObs)

      if (!obs) return toastWarning('Unable to create Obs')

      if (formData.capture_arv && formData.capture_arv.value === 'Yes') {
        const arv = await this.reception.createArvNumber(computedData.arv_number)

        if (!arv) return toastWarning('Unable to save Arv number')
      }

      toastSuccess('Encounter created')

      this.nextTask()
    },
    getFields(): Array<Field> {
      return [
        {
          id: "who_is_present",
          helpText: "Hiv Reception",
          type: FieldType.TT_MULTIPLE_YES_NO,
          validation: (val: any) => Validation.required(val) || Validation.neitherOr(val) || Validation.anyEmpty(val),
          computedValue: (d: Array<Option>) => {
            return {
              tag: 'obs',
              obs: d.map(({ other, value }: Option) => this.reception.buildValueCoded(other.concept, value))
            }
          },
          options: () => [
            {
              label: "Patient Present?",
              value: "",
              other: {
                concept: "Patient Present",
                property: "patient_present",
                values: this.yesNoOptions(),
              },
            },
            {
              label: "Guardian Present?",
              value: "",
              other: {
                concept: "Guardian Present",
                property: "guardian_present",
                values: this.yesNoOptions(),
              },
            }
          ]
        },
        {
          id: "capture_arv",
          helpText: "Capture ARV Number?",
          type: FieldType.TT_SELECT,
          requireNext: true,
          condition: () => !this.hasARVNumber,
          validation: (val: any) => Validation.required(val),
          options: () => this.yesNoOptions(),
        },
        {
          id: "arv_number",
          helpText: "ART number",
          type: FieldType.TT_TEXT,
          computedValue: ({ value }: Option) => {
            return this.reception.buildArvNumber(value)
          },
          validation: (val: any) => Validation.required(val),
          condition: (f: any) => !this.hasARVNumber && f.capture_arv.value === "Yes",
          defaultValue: () => this.suggestedNumber,
          config: {
            prepend: true,
            prependValue: `${this.reception.getSitePrefix()}-ARV-`,
          }
        }
      ]
    }
  }
});
</script>
