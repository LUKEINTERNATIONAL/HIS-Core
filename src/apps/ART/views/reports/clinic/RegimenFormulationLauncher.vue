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
import { REGIMENS, FORMULATIONS } from "@/apps/ART/services/reports/regimen_report_service"

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
                id: 'regimen',
                helpText: 'Select regimen',
                type: FieldType.TT_SELECT,
                validation: (val: Option) => Validation.required(val),
                options: () => REGIMENS.map((r: string) => ({ label: r, value: r }))
            },
            {
                id: 'formulation',
                helpText: 'Select formulation',
                type: FieldType.TT_SELECT,
                validation: (val: Option) => Validation.required(val),
                options: () => FORMULATIONS.map((f: string) => ({ label: f, value: f }))
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
                    'regimen': f.regimen.value,
                    'formulation': f.formulation.value
                } 
            })
        }
    }
})
</script>
