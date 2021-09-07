<template>
    <his-standard-form 
        :skipSummary="true" 
        :fields="fields" 
        @onFinish="onFinish"
    />
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { FieldType } from '@/components/Forms/BaseFormElements'
import { Option } from '@/components/Forms/FieldInterface'
import Validation from "@/components/Forms/validations/StandardValidations"

export default defineComponent({
    mixins: [ReportMixin],
    data: () => ({
      pathName: '' as string
    }),
    watch: {
        '$route' : {
            handler({ query }: any) {
                if (query && query.report) {
                    this.pathName = query.report
                }
            },
            deep: true,
            immediate: true
        }
    },
    async created() {
        this.fields = [
            ...this.getDateDurationFields(),
            {
                id: 'result_type',
                helpText: 'Select result type',
                type: FieldType.TT_SELECT,
                validation: (val: Option) => Validation.required(val),
                options: () => [
                    {
                        label: 'Viraemia 1000+',
                        value: 'viraemia-1000'
                    },
                    {
                        label: 'Suppressed',
                        value: 'suppressed'
                    },
                    {
                        label: 'Low level viraemia',
                        value: 'low-level-viraemia'
                    }
                ]
            }
        ] 
    },
    methods: {     
        onFinish(f: any, c: any) {
            this.$router.push({ 
                name: this.pathName,
                query: {
                    start: c.start_date,
                    end: c.end_date,
                    'result_type': f.result_type.value,
                    'result_title': f.result_type.label
                } 
            })
        }
    }
})
</script>
