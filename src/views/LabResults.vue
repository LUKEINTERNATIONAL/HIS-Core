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
import { toastWarning } from "@/utils/Alerts"
import { find } from 'lodash';
import HisDate from "@/utils/Date"
import { Service } from "@/services/service"

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
        numericValueIsValid(value: string){
            try {
                return value.match(/^(=|<|>)([0-9]*)$/m) ? true : false
            }catch(e) {
                return false
            }
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
                    group: 'test_indicator',
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
                    type: FieldType.TT_TEXT,
                    group: 'test_indicator',
                    computedValue: (v: Option, f: any) => {
                        const value = v.value.toString()
                        const modifier = value.charAt(0)
                        const result = parseInt(value.substring(1))
                        const test = f[`result_indicators`].filter((t: any) => t.value === id)[0]
                        return {
                            tag: 'result_indicator',
                            result,
                            modifier,
                            test: test.label
                        }
                    },
                    onValue: (v: Option) => {
                        if (v && v.value && !this.numericValueIsValid(v.value.toString())) {
                            toastWarning('You must enter a modifer and numbers only. i.e =90 / >19 / < 750')
                            return false
                        }
                        return true
                    },
                    validation: (v: Option) => Validation.required(v),
                    condition: (f: any) => condition(f) && f[`type_${id}`].value === 'numeric',
                    config: {
                        customKeyboard: [
                            [
                                ['1', '2', '3'],
                                ['4', '5', '6', '=', '<', '>'],
                                ['7', '8', '9', '.'],
                                ['',  '0', '']
                            ],
                            [
                                [ 'Delete']
                            ]
                        ]
                    }
                },
                {
                    id: `alpha_${id}`,
                    helpText: `Test Result (${name})`,
                    type: FieldType.TT_TEXT,
                    group: 'test_indicator',
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
                  type: FieldType.TT_TABLE_VIEWER,
                  options: () => {
                    const rows = this.testOptions.map(({other}: Option) => ([
                        other.accession, 
                        other.specimen, 
                        other.test,
                        HisDate.toStandardHisDisplayFormat(other.orderDate)
                    ]))
                    return [{
                        label: '',
                        value: '',
                        other: {
                            rows,
                            columns:[ 'Acession#', 'Specimen', 'Test', 'Order date']
                        }
                    }]
                  },
                  validation: (val: Option) => Validation.required(val)
                },
                ...generateDateFields({
                    id: 'result_date',
                    helpText: 'Result',
                    required: true,
                    estimation: {
                        allowUnknown: false
                    },
                    minDate: (f: any) => HisDate.toStandardHisFormat(f.test_type.other.orderDate),
                    maxDate: () => Service.getSessionDate(),
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
                ...this.generateTestIndicatorsFields(),
                {
                    id: 'entry_confirmation',
                    helpText: 'Confirm entry',
                    type: FieldType.TT_TABLE_VIEWER,
                    options: (f: any, c: any) => {
                        const rows = Object.values(c)
                                           .filter((d: any) => d.tag === 'result_indicator')
                                           .map((d: any) => ([d.test, d.modifier, d.result ]))
                        return [{
                            label: '',
                            value: '',
                            other: {
                                rows,
                                columns:[ 'Test', 'Modifier', 'Result']
                            }
                        }]
                    }
                }
            ]
        }
    }
})
</script>
