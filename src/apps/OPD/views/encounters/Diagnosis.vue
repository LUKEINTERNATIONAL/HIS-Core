<template>
  <his-standard-form :cancelDestinationPath="cancelDestination" :fields="fields" :onFinishAction="onSubmit"/>
</template>

<script lang="ts">
import { defineComponent} from 'vue'
import HisStandardForm from "@/components/Forms/TouchScreenForm.vue";
import EncounterMixinVue from '@/apps/ART/views/encounters/EncounterMixin.vue';
import { PatientDiagnosisService } from "@/apps/OPD/services/patient_diagnosis_service"
import { ClinicalNotesService } from "@/apps/OPD/services/clinical_notes_service";
import Validation from '@/components/Forms/validations/StandardValidations';
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import { actionSheet } from '@/utils/Alerts';
import { isEmpty } from 'lodash';
import { ConceptName } from '@/interfaces/conceptName';

export default defineComponent({
  components: { HisStandardForm },
  mixins: [EncounterMixinVue],
  data: () => ({
    activeField: '',
    notesService: {} as any,
    diagnosisList: [] as Array<any>,
    diagnosisService: {} as any,
    malariaActivated: false,
    malariaTestResult: ''
  }),
  watch: {
    ready: {
      async handler(isReady: boolean) {
        if(isReady){
          this.notesService = new ClinicalNotesService(this.patientID, this.providerID)
          this.diagnosisService = new PatientDiagnosisService(this.patientID, this.providerID)
          this.diagnosisList = await PatientDiagnosisService.getDiagnosis()
          // await PatientDiagnosisService.getMalariaTestResult(this.patient.getID())
          this.fields = this.getFields()
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    async onSubmit(formData: any, computedData: any){   
      const obs = this.buildObs({...formData});
      await this.diagnosisService.createEncounter()
      await this.notesService.createEncounter()
      
      const diagnosisData = await this.resolveObs({...obs}, 'diagnosis')      
      await this.diagnosisService.saveObservationList(diagnosisData)

      const notesData = await this.resolveObs({...obs}, 'notes')
      await this.notesService.saveObservationList(notesData)

      this.nextTask()        
    },
    mapListToOptions(list: ConceptName[]){
      if(isEmpty(list)) return []

      return list.map(item => ({
        label: item.name, value: item.name, other: item.concept_id
      }))
    },
    buildObs(formData: any){
      const obs: Array<any> = []
      for (const key in formData) {
        if(key === 'primary_diagnosis'){
          Object.values(formData[key]).forEach(({ other }: any) =>  obs.push({
            tag: 'diagnosis',
            obs: this.diagnosisService.buildValueCodedFromConceptId('Primary diagnosis', other)
          }))
        } else if (key === 'secondary_diagnosis'){
          Object.values(formData[key]).forEach(({ other }: any) =>  obs.push({
            tag: 'diagnosis',
            obs: this.diagnosisService.buildValueCodedFromConceptId('Secondary diagnosis', other)
          }))
        } else {
          obs.push({
            tag: 'notes',
            obs: this.notesService.buildValueText('Clinical notes construct', formData[key].value)
          })
        }
      }
      return obs;
    },
    checkMalariaResult(){

      if(!this.malariaTestResult) {
        actionSheet("Malaria Test", "No malaria test was found", ['Continue'])
      } else if (this.malariaTestResult.match(/negative/i)) {
        actionSheet("Malaria Test", "Negative results detected", ['Continue'])
      } 
      
      return null

    },
    getFields(): Array<Field>{
      return [
        {
          id: 'primary_diagnosis',
          helpText: 'Select primary diagnosis',
          type: FieldType.TT_MULTIPLE_SELECT,
          validation: (value: any) => Validation.required(value),
          options: () => this.mapListToOptions(this.diagnosisList),
          summaryMapValue: ({ value }: Option) => ({
            value,
            label: "Primary diagnosis"
          }),
          config: {
            showKeyboard: true,
          }
        },
        {
          id: 'secondary_diagnosis',
          helpText: 'Select secondary diagnosis',
          type: FieldType.TT_MULTIPLE_SELECT,
          options: () => this.mapListToOptions(this.diagnosisList),
          summaryMapValue: ({ value }: Option) => ({
            value,
            label: "Secondary diagnosis"
          }),
          config: {
            showKeyboard: true,
          }
        },
        {
          id: 'clinical_notes',
          helpText: 'Clinical notes',
          type: FieldType.TT_TEXT,
        },
      ]
    }
  }
})
</script>

