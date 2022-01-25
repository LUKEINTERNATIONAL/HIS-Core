<template>
  <ion-page>
    <his-standard-form :cancelDestinationPath="cancelDestination" :fields="fields" :onFinishAction="onSubmit"/>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import HisStandardForm from "@/components/Forms/TouchScreenForm.vue";
import EncounterMixinVue from '@/apps/ART/views/encounters/EncounterMixin.vue';
import { PatientComplaintsService } from "@/apps/OPD/services/patient_complaints_service";
import LabOrderModal from "@/components/DataViews/LabOrderModal.vue"
import Validation from '@/components/Forms/validations/StandardValidations';
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import { modalController, IonPage } from '@ionic/vue';

export default defineComponent({
  components: { HisStandardForm, IonPage },
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
    async launchOrderSelection() {
      const modal = await modalController.create({
        component: LabOrderModal,
        backdropDismiss: false,
        cssClass: 'large-modal'
      })
      modal.present()
      await modal.onDidDismiss()
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
          config: {
            footerBtns: [
              {
                name: "Lab Order",
                size: "large",
                slot: "end",
                color: "primary",
                visible: true,
                onClick: async () => await this.launchOrderSelection(),
                visibleOnStateChange: (state: Record<string, any>) => {
                  return state.index === 1;
                },
              },
            ],
          }
        },
      ]
    }
  }
})
</script>

