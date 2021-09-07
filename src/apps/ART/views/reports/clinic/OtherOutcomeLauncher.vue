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
                id: 'outcome',
                helpText: 'Select outcome',
                type: FieldType.TT_SELECT,
                validation: (val: Option) => Validation.required(val),
                options: () => [
                    {
                        label: 'Transfer Out',
                        value: 'Transfer Out'
                    },
                    {
                        label: 'Died',
                        value: 'Died'
                    },
                    {
                        label: 'Stopped',
                        value: 'Stopped'
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
                    outcome: f.outcome
                } 
            })
        }
    }
})
</script>

