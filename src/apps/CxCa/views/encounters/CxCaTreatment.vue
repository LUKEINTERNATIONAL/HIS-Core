

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
import EncounterMixinVue from "../../../../views/EncounterMixin.vue";
import {TreatmentService} from "@/apps/CxCa/services/CxCaTreatmentService"
import { toastSuccess, toastWarning } from "@/utils/Alerts";
import { ProgramService } from "@/services/program_service";
import {ProgramWorkflow} from "@/interfaces/program_workflow"


export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  data: () => ({
    reception: {} as any,
  }),
  watch: {
    patient: {
      async handler() {
        this.reception = new TreatmentService(
          this.patientID,
          this.providerID
        );
        this.fields = this.getFields();
      },
      deep: true,
    },
  },
  methods: {
    async onFinish(formData: any) {
      const encounter = await this.reception.createEncounter();

      if (!encounter) return toastWarning("Unable to create encounter");
      const programID = ProgramService.getProgramID();
      const workflows: ProgramWorkflow[] = await ProgramService.getProgramWorkflows(ProgramService.getProgramID());
      const flows = {} as any;
      workflows.forEach(w => {
        w.states.forEach(f => {
          const conceptID = f.program_workflow_state_id;
          const conceptName = f.concept.concept_names[0].name;
          flows[conceptName] = conceptID;
        })
      })
      const state = {
        'location_id': ProgramService.getLocationName(),
        state: flows['Continue follow-up'],
        date: ProgramService.getSessionDate()
      }
      const saveState = await ProgramService.createState(this.patientID, programID, state);
      if(!saveState) return toastWarning('Unable to update state')
      const data = formData['referral_outcome'];
      const receptionObs = await this.reception.buildValueCoded('Cancer treatment procedure', data.value);

      const obs = await this.reception.saveObs(receptionObs)
      toastSuccess("Observations and encounter created!");
      this.nextTask();
    },
    
    getFields(): any {
      return [
        {
          id: "referral_outcome",
          helpText: "Treatment performed",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => this.mapOptions([
            "Cryotherapy","Leep","Thermocoagulation","Other"
          ])
        },
      ];
    },
  },
});
</script>