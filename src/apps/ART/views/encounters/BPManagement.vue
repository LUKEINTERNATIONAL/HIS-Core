<template>
  <his-standard-form
    :fields="fields"
    :activeField="activeField"
    @onFinish="onFinish"
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
    htn: {} as any,
    activeField: "",
    hasARVNumber: true,
    suggestedNumber: "" as any,
  }),
  watch: {
    patient: {
      async handler(patient: any) {
        console.log('Reception', this.providerID)
        this.htn = new ReceptionService(patient.getID(), this.providerID)
        this.fields = this.getFields();
      },
      deep: true
    },
  },
  methods: {
    async onFinish(formData: any, computedData: any) {
      const encounter = await this.htn.createEncounter()

      if (!encounter) return toastWarning('Unable to create encounter')

      const registrationObs = await this.resolveObs(computedData, 'obs')

      const obs = await this.htn.saveObservationList(registrationObs)

      if (!obs) return toastWarning('Unable to create Obs')

      toastSuccess('Encounter created')

      this.nextTask()
    },
    getFields(): Array<Field> {
      return [
        {
          id: "bp_management",
          helpText: "Hiv Reception",
          type: FieldType.TT_BP_MANAGEMENT,
          validation: (val: any) => Validation.required(val),
          options: () => ([
                        {
                            label: '',
                            value: '',
                            other: {
                                values: this.yesNoOptions(),
                            }
                        }
                    ])
        },
      ]
    }
  }
});
</script>