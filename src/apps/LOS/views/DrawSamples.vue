<template>
    <his-standard-form :fields="fields" @onFinish="onSubmit"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Field, Option } from "@/components/Forms/FieldInterface"
import EncounterMixinVue from '@/apps/ART/views/encounters/EncounterMixin.vue'
import {getFacilities} from "@/utils/HisFormHelpers/LocationFieldOptions"
import Validation from "@/components/Forms/validations/StandardValidations"
import { PatientLabService } from "@/apps/LOS/services/patient_lab_service"
import { OrderService } from "@/services/order_service"
import { ConceptService } from '@/services/concept_service'
import PersonField from "@/utils/HisFormHelpers/PersonFieldHelper"

export default defineComponent({
    mixins: [EncounterMixinVue],
    data: () => ({
        service: {} as any,
        fields: [] as Field[]
    }),
    watch: {
        patient: {
            async handler(patient: any) {
                this.service = new PatientLabService(patient.getID())
                this.fields = [
                    this.getFacililityLocationField(),
                    this.getReasonForTestField(),
                    this.getTestSelectionField(),
                    this.getTestCombinationField()
                ]
            },
            deep: true
        }
    },
    methods: {
        async onSubmit(_: any, computed: any) {
            const req = await this.service.placeOrder(computed)
            if (req) {
                await this.service.printSpecimenLabel(req[0].order_id)
                this.$router.push(`/patient/dashboard/${this.patientID}`)
            } 
        },
        getClinianGivenNameField(): Field {
            const field = PersonField.getGivenNameField()
            field.helpText = 'Requesting clinician - First name'
            return field
        },
        getClinianFamilyNameField(): Field {
            const field = PersonField.getGivenNameField()
            field.helpText = 'Requesting clinician - Last name'
            return field
        },
        getFacililityLocationField(): Field {
            return {
                id: 'target_lab',
                helpText: 'Requesting location',
                type: FieldType.TT_SELECT,
                defaultValue: () => PatientLabService.getLocationName(),
                validation: (val: Option) => Validation.required(val),
                options: (_: any, filter='') => getFacilities(filter),
                computedValue: (val: Option) => val.label,
                config: {
                    showKeyboard: true,
                    isFilterDataViaApi: true
                }
            }
        },
        getReasonForTestField(): Field {
            return {
                id: 'reason_for_test_id',
                helpText: 'Reason for test',
                type: FieldType.TT_SELECT,
                validation: (val: Option) => Validation.required(val),
                computedValue: (val: any) => ConceptService.getCachedConceptID(
                    val.value
                ),
                options: () => [
                    {label: 'Routine', value: 'Routine'},
                    {label: 'Targeted', value: 'Targeted'},
                    {label: 'Confirmatory', value: 'Confirmatory'},
                    {label: 'Repeat / Missing', value: 'Repeat / Missing'},
                    {label: 'Stat', value: 'Stat'}
                ]
            }
        },
        getTestSelectionField(): Field {
            return {
                id: 'tests',
                helpText: 'Select tests',
                type: FieldType.TT_MULTIPLE_SELECT,
                validation: (val: Option) => Validation.required(val),
                computedValue: (val: Array<Option>) => {
                    return val.map(v => ({'concept_id': v.value}))
                },
                options: async () => {
                    const req = await OrderService.getTestTypes()
                    return req.map((t: any) => ({
                        label: t.name,
                        value: t.concept_id,
                        other: t
                    }))
                }
            }
        },
        getTestCombinationField(): Field {
            return {
                id: 'combine_tests',
                helpText: 'Combine test(s) in one order',
                type: FieldType.TT_SELECT,
                computedValue: (val: Option) => val.value === 'Yes',
                condition: (f: any) => f.tests.length > 1,
                validation: (val: Option) => Validation.required(val),
                options: () => this.yesNoOptions()
            }
        }
    }
})
</script>
