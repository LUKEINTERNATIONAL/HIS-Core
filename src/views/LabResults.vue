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
import { PatientLabResultService } from "@/services/patient_lab_result_service"
import Validation from "@/components/Forms/validations/StandardValidations"
import { find } from 'lodash';

export default defineComponent({
    components: { HisStandardForm },
    data: () => ({
        labResult: {} as any,
        hisFormKey: 0 as number,
        patient: {} as any,
        fields: [] as Array<Field>,
        testOptions: [] as Array<any>,
        testIndicators: [] as Array<any>
    }),
    watch: {
        '$route': {
            async handler({params}: any) {
                if (params && params.patient_id) {
                    this.patient = params.patient_id
                    this.labResult = new PatientLabResultService(this.patient)
                    await this.initData()
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
        generateTestIndicatorsFields() {
            let fields: Array<Field> = []
            this.testIndicators.forEach((i: any) => {
               fields = [ 
                   ...fields, 
                   ...this.buildTestIndicatorFields(
                       i.indicatorId, 
                       i.indicatorName, 
                       i.testId
                    )
                ]
            })
            return fields
        },
        buildTestIndicatorFields(id: number, name: string, test: number): Array<Field> {
            const condition = (f: any) => [
                    f.test_type.value === test, 
                    find(f.result_indicators, { label: name}) ? true : false
            ].every(Boolean)
            return [
                {
                    id: `type_${id}`,
                    helpText: `Result type (${name})`,
                    type: FieldType.TT_SELECT,
                    group: `${id}`,
                    condition,
                    appearInSummary: () => false,
                    validation: (v: Option) => Validation.required(v),
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
                    id: `num_${id}`,
                    helpText: `Test Result (${name})`,
                    type: FieldType.TT_NUMBER,
                    group: `${id}`,
                    validation: (v: Option) => Validation.required(v),
                    condition: (f: any) => condition(f) && f[`type_${id}`].value === 'numeric'
                },
                {
                    id: `alpha_${id}`,
                    helpText: `Test Result (${name})`,
                    type: FieldType.TT_TEXT,
                    group: `${id}`,
                    validation: (v: Option) => Validation.required(v),
                    condition: (f: any) => condition(f) && f[`type_${id}`].value === 'alphanumeric'
                }
            ]
        },
        async initData() {
            const orders = await this.labResult.getTestsWithoutResults()
            for(const i in orders) {
                const orderData = orders[i]
                for(const testIndex in orderData.tests) {
                    const test = orderData.tests[testIndex]
                    this.labResult.setTestTypeID(test.concept_id)
                    const indicators = await this.labResult.getTestIndicators()
                    const testIndicators = indicators.map((i: any) =>({
                        testId: test.id,
                        indicatorName: i.name,
                        indicatorId: i.concept_id
                    }))
                    this.testIndicators = [...this.testIndicators, ...testIndicators]
                    this.testOptions.push({
                        label: test.name,
                        value: test.id,
                        other: {
                            accession: orderData.accession_number,
                            specimen: orderData.specimen.name,
                            test: test.name,
                            orderDate: orderData.order_date,
                            testIndicators
                        }
                    })
                }
            }
        },
        getFields(): Array<Field> {
            return [
                {
                  id: 'test_type',
                  helpText: 'Tests without results',
                  type: FieldType.TT_SELECT,
                  options: () => this.testOptions,
                  validation: (val: Option) => Validation.required(val)
                },
                ...generateDateFields({
                    id: 'result_date',
                    helpText: 'Result',
                    required: true,
                    estimation: {
                        allowUnknown: false,
                    },
                    computeValue: (date: string) => date
                }),
                {
                    id: `result_indicators`,
                    helpText: `Select test result indicators`,
                    type: FieldType.TT_MULTIPLE_SELECT,
                    validation: (v: Option) => Validation.required(v),
                    options: (f: any) => {                       
                        return f.test_type
                                .other
                                .testIndicators
                                .map((i: any) => ({
                                    label: i.indicatorName,
                                    value: i.indicatorId
                                }))
                    },
                },
                ...this.generateTestIndicatorsFields()
            ]
        }
    }
})
</script>
