<template>
  <his-standard-form :cancelDestinationPath="cancelDestination" :fields="fields" :onFinishAction="onSubmit"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import HisStandardForm from "@/components/Forms/TouchScreenForm.vue";
import EncounterMixinVue from '@/apps/ART/views/encounters/EncounterMixin.vue';
import { PatientComplaintsService } from "@/apps/OPD/services/patient_complaints_service";
import Validation from '@/components/Forms/validations/StandardValidations';
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';

export default defineComponent({
  components: { HisStandardForm },
  mixins: [EncounterMixinVue],
  data: () => ({
    complaintsService: {} as any,
  }),
  watch: {
    ready: {
      async handler(isReady: boolean) {
        if(isReady){
          this.complaintsService = new PatientComplaintsService(this.patientID, this.providerID)
          this.fields = this.getFields()
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    async onSubmit(_: any, computedData: any){     
      const data = await Promise.all(computedData.complaints)   
      await this.complaintsService.createEncounter()    
      await this.complaintsService.saveObservationList(data)
      this.nextTask()        
    },
    getFields(): Array<Field>{
      return [
        {
          id: 'complaints',
          helpText: 'Presenting Complaints',
          type: FieldType.TT_COMPLAINTS_PICKER,
          validation: (data: any) => Validation.required(data),
          computedValue: (options: Option[]) => {
            const obs = options.map(option => {
              const parentObs = this.complaintsService.buildValueCoded('Presenting complaint', option.other.parent)
              const childObs = this.complaintsService.buildValueCodedFromConceptId(option.other.parent, option.other.concept_id)
             return [parentObs, childObs]
            })
            return obs.flat(1)
          },
        },
      ]
    }
  }
})
</script>

