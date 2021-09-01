<template>
    <his-standard-form 
        :skipSummary="true" 
        :fields="fields" 
        @onFinish="onSubmit"
    />
</template>
<script lang='ts'>
import { defineComponent } from 'vue'
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Field } from "@/components/Forms/FieldInterface"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"

export default defineComponent({
    mixins: [ReportMixin],
    created() {
        this.fields = this.getFields()
    },
    methods: {
        getFields(): Array<Field> {
            return [
                ...this.getDateDurationFields(),
                {
                    id: 'report',
                    helpText: 'ART disaggregated report',
                    type: FieldType.TT_TABLE_VIEWER,
                    options: () => {
                       return [{
                           label: '',
                           value: '',
                           other: {
                               rows: [
                                   [0, '0-5 months', 2, 3, 4, 5],
                                   [2, '6-11 months', 2, 3, 4, 5],
                                   [3, '12-23 months', 2, 3, 4, 5],
                                   [4, '5-9 years', 2, 3, 4, 5],
                               ],
                               columns: [
                                   '#', 
                                   'Age group', 
                                   'Gender', 
                                   'Tx new (new on ART)', 
                                   'TX curr (received IPT)', 
                                   'TX curr (screened for TB)'
                                ]
                           }
                       }] 
                    },
                    config: {
                        footerBtns: [
                            {
                                name: 'Rebuild Outcomes',
                                size: 'large',
                                slot: 'start',
                                color: 'success',
                                visibleOnStateChange: (state: any) => {
                                    return state.field.id === 'report'
                                }
                            }
                        ],
                        hiddenFooterBtns: [
                            'Cancel',
                            'Clear'
                        ],
                        styles: ['his-table', 'table-borders']
                    }
                }
            ]
        }
    }
})
</script>
