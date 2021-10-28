<template>
    <his-standard-form :cancelDestinationPath="cancelDestination" :fields="fields" :onFinishAction="onSubmit"/>
</template>

<script lang="ts">
import { defineComponent} from 'vue'
import HisStandardForm from "@/components/Forms/TouchScreenForm.vue";
import EncounterMixinVue from '@/apps/ART/views/encounters/EncounterMixin.vue';
import { PatientVisitRegistrationService } from "@/apps/OPD/services/patient_registration_service"
import { PatientIdentifierService } from "@/services/patient_identifier_service";
import Validation from '@/components/Forms/validations/StandardValidations';
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import { getFacilities } from '@/utils/HisFormHelpers/LocationFieldOptions';
import { generateDateFields } from '@/utils/HisFormHelpers/MultiFieldDateHelper';
import { toastWarning } from '@/utils/Alerts';

export default defineComponent({
    components: { HisStandardForm },
    mixins: [EncounterMixinVue],
    data: () => ({
        registrationService: {} as any
    }),
    watch: {
        ready: {
            async handler(isReady: boolean) {
                if(isReady){
                    this.registrationService = new PatientVisitRegistrationService(this.patient.getID(), this.providerID)
                    this.fields = this.getFields()
                }
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        async onSubmit(formData: any, computedData: any){
            await this.asignNID(formData)
            const encounter = await this.registrationService.createEncounter()
            if (!encounter) return toastWarning('Unable to create registration encounter')
            
            const registrationData = await this.resolveObs({...computedData})
            const registrationObs = await this.registrationService.saveObservationList(registrationData)
            if (!registrationObs) return toastWarning('Unable to save observations')

            this.nextTask()        
        },
        async asignNID(formData: any) {
            const nidAvailable = formData['national_id_available']
            const nid = formData['national_id']

            if(nidAvailable && nidAvailable['value'] === 'Yes') {
                // 28 = Malawi National Identifier Type Id
                await PatientIdentifierService.create(this.patient.getID(), 28, nid['value'])
            }
        },
        buildDateObs(conceptName: string, date: string, isEstimate: boolean) {
            let obs = {}
            if (date.match(/unknown/i)) {
                obs = this.registrationService.buildValueText(conceptName, 'Unknown')
            } else if (isEstimate) {
                obs = this.registrationService.buildValueDateEstimated(conceptName, date)
            } else {
                obs = this.registrationService.buildValueDate(conceptName, date)
            }
            return obs
        },
        getFields(): Array<Field>{
            return [
                {
                    id: 'visit_type',
                    helpText: 'Type of visit',
                    type: FieldType.TT_SELECT,
                    validation: (value: any) => Validation.required(value),
                    computedValue: ({value}: Option) => ({ obs: this.registrationService.buildValueCoded('Type of visit', value)}),
                    options: () => {
                        return [
                            { label: 'New', value: 'New patient' },
                            { label: 'Referral', value: 'Referral' },
                            { label: 'Re-visiting', value: 'Re-visiting' },
                        ]
                    }
                },
                {
                    id: 'referring_facility_name',
                    helpText: 'Referred from',
                    type: FieldType.TT_SELECT,
                    validation: (value: any) => Validation.required(value),
                    computedValue: ({ label }: Option) => ({obs: this.registrationService.buildValueText('Referred from', label)}),
                    condition: (fields: any) => fields.visit_type.value === 'Referral',
                    options: () => getFacilities(''),
                    config: {
                        showKeyboard: true,
                        isFilterDataViaApi: true
                    }
                },
                {
                    id: 'national_id_available',
                    helpText: 'National ID avalable',
                    type: FieldType.TT_SELECT,
                    validation: (value: any) => Validation.required(value),
                    condition: () => this.patient.findIdentifierByType('Malawi National ID') === 'Unknown',
                    options: () => this.yesNoUnknownOptions(),
                    appearInSummary: () => false
                },
                {
                    id: 'national_id',
                    helpText: 'Enter National ID',
                    type: FieldType.TT_TEXT,
                    validation: (value: any) => Validation.required(value),
                    condition: (fields: any) => fields.national_id_available.value === 'Yes',
                    summaryMapValue: ({ value }: Option) => ({
                        value,
                        label: 'National ID'
                    })
                },
                {
                    id: 'hiv_status',
                    helpText: 'HIV status',
                    type: FieldType.TT_SELECT,
                    validation: (value: any) => Validation.required(value),
                    computedValue: ({ value }: Option) => ({obs: this.registrationService.buildValueText('HIV status', value)}),
                    options: () => ([
                        { label: 'Positive not ART', value: 'Positive not ART' },
                        { label: 'Posititve on ART', value: 'Positive on ART' },
                        { label: 'Previous negative', value: 'Previous negative' },
                        { label: 'New positive', value: 'New positive' },
                        { label: 'New negative', value: 'New negative' },
                        { label: 'Never tested', value: 'Never tested' },
                    ])
                },
                ...generateDateFields({
                    id: 'hiv_test_date',
                    helpText: 'HIV Test',
                    required: true,
                    minDate: () => this.patient.getBirthdate(),
                    condition: (fields: any) => fields.hiv_status.value !== 'Never tested',
                    summaryLabel: 'HIV test date',
                    estimation: {
                        allowUnknown: true
                    },
                    computeValue: (date: string, isEstimate: boolean) => this.buildDateObs('HIV test date', date, isEstimate)
                    
                }, this.registrationService.getDate()),
                {
                    id: 'test_location',
                    helpText: 'HIV test location',
                    type: FieldType.TT_SELECT,
                    validation: (value: any) => Validation.required(value),
                    computedValue: ({ label }: Option) => ({obs: this.registrationService.buildValueText('HIV test location', label)}),
                    condition: (fields: any) => fields.hiv_status.value !== 'Never tested',
                    options: () => getFacilities(''),
                },
                {
                    id: 'patient_pregnant',
                    helpText: 'Patient pregnant',
                    type: FieldType.TT_SELECT,
                    validation: (value: any) => Validation.required(value),
                    computedValue: ({value}: Option) => ({obs: this.registrationService.buildValueCoded('PATIENT PREGNANT', value)}),
                    condition: () => this.patient.isChildBearing(),
                    options: () => this.yesNoUnknownOptions(),
                    config: {
                        showKeyboard: true,
                        isFilterDataViaApi: true
                    }
                }
            ]
        }
    }
})
</script>

