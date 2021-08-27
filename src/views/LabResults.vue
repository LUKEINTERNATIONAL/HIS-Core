<template>
    <his-standard-form 
        :key="hisFormKey" 
        :fields="fields" 
        @onFinish="onSubmit"
    />
</template>
<script lang='ts'>
import { defineComponent } from 'vue'
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { FieldType } from "@/components/Forms/BaseFormElements"
import { generateDateFields } from "@/utils/HisFormHelpers/MultiFieldDateHelper"
import { Field, Option } from '@/components/Forms/FieldInterface'

export default defineComponent({
    components: { HisStandardForm },
    data: () => ({
        hisFormKey: 0 as number,
        patient: {} as any,
        fields: [] as Array<Field>
    }),
    watch: {
        '$route': {
            async handler({params}: any) {
                if (params && params.patient_id) {
                    this.patient = params.patient_id
                    this.fields = this.getFields()
                }
            },
            deep: true,
            immediate: true
        }
    },
    methods: {
        onSubmit() {
            //TODO: submit somthing
        },
        getFields(): Array<Field> {
            return [
                {
                  id: 'select_test',
                  helpText: 'Tests without results',
                  type: FieldType.TT_SELECT,
                  options: () => [] 
                },
                ...generateDateFields({
                    id: 'program_outcome_date',
                    helpText: 'Result',
                    required: true,
                    estimation: {
                        allowUnknown: false,
                    },
                    computeValue: (date: string) => date
                }),
                {
                    id: 'test_result_indicator',
                    helpText: 'Select test result indicators',
                    type: FieldType.TT_MULTIPLE_SELECT,
                    options: () => []
                },
                {
                    id: 'result_type',
                    helpText: 'Result type',
                    type: FieldType.TT_SELECT,
                    appearInSummary: () => false,
                    options: () => [
                        {
                            label: 'Numeric (numbers only)',
                            value: 'numeric'
                        },
                        {
                            label: 'Alphanumeric(text/text and numbers)',
                            value: 'alphanumeric'
                        }
                    ]
                },
                {
                    id: 'numeric_test_result',
                    helpText: 'Test Result',
                    type: FieldType.TT_NUMBER,
                    group: 'lab_result',
                    condition: (f: any) => f.result_type.value === 'numeric'
                },
                {
                    id: 'alphanumeric_result',
                    helpText: 'Test Result',
                    type: FieldType.TT_TEXT,
                    group: 'lab_result',
                    condition: (f: any) => f.result_type.value === 'alphanumeric'
                }
            ]
        }
    }
})
</script>
