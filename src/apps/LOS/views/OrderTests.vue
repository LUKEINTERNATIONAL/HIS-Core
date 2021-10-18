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

export default defineComponent({
    mixins: [EncounterMixinVue],
    data: () => ({
        fields: [] as Field[],
        service: {} as any
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
        getFacililityLocationField(): Field {
            return {
                id: 'location',
                helpText: 'Requesting location',
                type: FieldType.TT_SELECT,
                validation: (val: Option) => Validation.required(val),
                options: (_: any, filter='') => getFacilities(filter),
                config: {
                    showKeyboard: true,
                    isFilterDataViaApi: true
                }
            }
        },
        getReasonForTestField(): Field {
            return {
                id: 'reason_for_test',
                helpText: 'Reason for test',
                type: FieldType.TT_SELECT,
                validation: (val: Option) => Validation.required(val),
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
                options: async () => {
                    const req = await PatientLabService.getTestTypes()
                    return req.map((t: any) => ({
                        label: t.name,
                        value: '',
                        other: t
                    }))
                }
            }
        },
        getTestCombinationField(): Field {
            return {
                id: 'combine_tests_in_one_order',
                helpText: 'Combine test(s) in one order',
                type: FieldType.TT_SELECT,
                condition: (f: any) => f.tests.length > 1,
                validation: (val: Option) => Validation.required(val),
                options: () => this.yesNoOptions()
            }
        }
    }
})
</script>
