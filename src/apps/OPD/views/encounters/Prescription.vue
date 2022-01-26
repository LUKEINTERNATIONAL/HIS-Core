<template>
  <his-standard-form :cancelDestinationPath="cancelDestination" :fields="fields" :activeField="activeField" :onFinishAction="onSubmit"/>
</template>

<script lang="ts">
import { defineComponent} from 'vue'
import HisStandardForm from "@/components/Forms/TouchScreenForm.vue";
import EncounterMixinVue from '@/views/EncounterMixin.vue';
import Validation from '@/components/Forms/validations/StandardValidations';
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import { isEmpty } from 'lodash';
import { ANTI_MALARIA_DRUGS, DrugPrescriptionService, DRUG_DOSE_FREQUENCIES } from '../../services/drug_prescription_service';
import { modalController } from '@ionic/core';
import PrescriptionModalVue from '@/apps/OPD/components/PrescriptionModal.vue';
import HisDate from "@/utils/Date"
import { alertConfirmation, toastSuccess, toastWarning } from '@/utils/Alerts';

export default defineComponent({
  components: { HisStandardForm },
  mixins: [EncounterMixinVue],
  data: () => ({
    activeField: '',
    prescriptionService: {} as any,
    hasMalaria: false,
    drugOrders: [] as any
  }),
  watch: {
    ready: {
      async handler(isReady: boolean) {
        if(isReady){
          this.prescriptionService = new DrugPrescriptionService(this.patientID, this.providerID)
          await this.prescriptionService.loadDrugs()    
          this.hasMalaria = await this.prescriptionService.hasMalaria()
          this.fields = this.getFields()
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    async onSubmit(){   
      const encounter = await this.prescriptionService.createEncounter()
      if (!encounter) return toastWarning('Unable to create treatment encounter')   
      const drugOrder = await this.prescriptionService.createDrugOrder(this.drugOrders);
      if(!drugOrder) return toastWarning('Unable to create drug orders!')
      toastSuccess('Drug order has been created')
      this.nextTask()       
    },
    async getPrescriptionDetails(prescribedDrugs: Option[]) {
      const modal = await modalController.create({
        component: PrescriptionModalVue,
        backdropDismiss: false,
        cssClass: "large-modal",
        componentProps: {
          prescribedDrugs
        }
      });
      modal.present();
      const { data } = await modal.onDidDismiss();
      return data
    },
    getFrequencyCount(frequency: Record<string, boolean>) {
      return Object.values(frequency).filter(value => value).length
    },
    calculateExpireDate(startDate: string | Date, duration: number ) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + duration)
      return HisDate.toStandardHisFormat(date)
    },
    mapToOrders(prescriptions: any[]): any[] {
      return prescriptions.map(drug => {
        const startDate = DrugPrescriptionService.getSessionDate()
        const frequencyCount = (typeof drug.frequency === 'number') ? drug.frequency :  this.getFrequencyCount(drug.frequency)
        const frequency = DRUG_DOSE_FREQUENCIES[frequencyCount]
        return {
          'drug_inventory_id': drug.drug_id,
          'equivalent_daily_dose': drug.dose_strength * frequencyCount,
          'start_date': startDate,
          'auto_expire_date': this.calculateExpireDate(startDate, drug.duration), 
          'units': drug.units,
          'instructions': `${drug.name}: ${frequencyCount} ${frequency} for ${drug.duration}`,
          'dose': drug.dose_strength,
          'frequency': frequency
        }
      })
    },
    getFields(): Array<Field>{
      return [
        {
          id: 'drugs',
          helpText: 'Select drugs',
          type: FieldType.TT_MULTIPLE_SELECT,
          validation: (data: any) => Validation.required(data),
          options: () => this.prescriptionService.getDrugOptions(),
          onload: () => this.activeField = '',
          beforeNext: async (data: Option[]) => {
            const prescriptions = await this.getPrescriptionDetails(data)
            if(isEmpty(prescriptions)) return false
            this.drugOrders = this.mapToOrders(prescriptions)
            return true
          },
          config: {
            showKeyboard: true,
            footerBtns: [
              {
                name: 'Predefined Malaria Drugs',
                color: 'primary',
                size: 'large',
                visible: false,
                slot: 'end',
                onClick: async () => {
                  if(this.hasMalaria) this.activeField = 'malaria_drugs'
                  const ok = await alertConfirmation('Patient has no malaria. Do you still want to prescribe anti malaria drugs?')
                  if(ok) this.activeField = 'malaria_drugs'
                }
              },
            ]
          }
        },
        {
          id: 'malaria_drugs',
          helpText: "select Malaria Drugs",
          validation: (data: any) => Validation.required(data),
          type: FieldType.TT_SELECT,
          condition: () => this.activeField === 'malaria_drugs',
          onValue: (data: Option) => {
            if(isEmpty(data)) return false
            this.drugOrders = this.mapToOrders([data.other])
            return true
          },
          options: () => ANTI_MALARIA_DRUGS.map(drug => ({
            label: `${drug.name}, ${drug.frequency} time(s) a day, for ${drug.duration} days`,
            value: drug.name,
            other: drug
          }))
        }
      ]
    }
  }
})
</script>

