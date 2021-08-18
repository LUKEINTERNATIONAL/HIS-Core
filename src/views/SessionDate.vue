<template>
    <his-standard-form :skipSummary="true" :fields="fields" @onFinish="onSubmit"/>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { Option } from "@/components/Forms/FieldInterface"
import { Field } from "@/components/Forms/FieldInterface"
import { Service } from "@/services/service"
import Validation from "@/components/Forms/validations/StandardValidations"
import { toastWarning, toastSuccess} from "@/utils/Alerts"
import { generateDateFields } from "@/utils/HisFormHelpers/MultiFieldDateHelper"
import HisDate from "@/utils/Date"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";

export default defineComponent({
    components: { HisStandardForm },
    data: () => ({
        fields: [] as Array<Field>
    }),
    created(){
        this.fields = generateDateFields({
            id: 'session_date',
            helpText: 'Session Date',
            estimation: {
                allowUnknown: false
            },
            validation: (v: Option) => Validation.required(v),
            computeValue: (date: string) => date
        }, '')
    },
    methods: {
        async onSubmit(f: any, computedData: any) {
            const date = computedData.session_date
            await Service.setSessionDate(date)
            toastSuccess(`Successfully Back dated to ${HisDate.toStandardHisDisplayFormat(date)}`)
        }
    }
})
</script>
