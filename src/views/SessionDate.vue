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
import { infoActionSheet } from "@/utils/ActionSheets"

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
    async mounted() {
        await this.showBdeNotice()
    },
    methods: {
        async showBdeNotice() {
            if (!Service.isBDE()) return
            const apiDate = HisDate.toStandardHisDisplayFormat(
                Service.getCachedApiDate() || ''
            )
            const sessionDate = HisDate.toStandardHisDisplayFormat(
                Service.getSessionDate()
            )
            const action = await infoActionSheet(
                'BDE Notice',
                `The system is currently in Back Data Entry Mode(BDE). \
                Do you wish to reset the date to ${apiDate}?`,
                `BDE Date: ${sessionDate}`,
                 [
                    { name: `Yes, Reset to ${apiDate}`, slot: 'start', color: 'primary'},
                    { name: `No, keep ${sessionDate}`, slot: 'end', color: 'danger' }
                ],
            )
            if (action != `No, keep ${sessionDate}`) {
                try {
                    await Service.resetSessionDate()
                    return toastSuccess('Session date has been reset!')
                } catch (e) {
                    toastWarning(e)
                }
            }
        },
        async onSubmit(_: any, computedData: any) {
            const date = computedData.session_date
            try {
                await Service.setSessionDate(date)
                toastSuccess(`Successfully Back dated to ${HisDate.toStandardHisDisplayFormat(date)}`)
            } catch(e) {
                toastWarning(e)
            }
        }
    }
})
</script>
