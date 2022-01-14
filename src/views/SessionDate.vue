<template>
    <his-standard-form :skipSummary="true" :fields="fields" @onFinish="onSubmit"/>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { Field } from "@/components/Forms/FieldInterface"
import { Service } from "@/services/service"
import { toastWarning, toastSuccess} from "@/utils/Alerts"
import { generateDateFields } from "@/utils/HisFormHelpers/MultiFieldDateHelper"
import HisDate from "@/utils/Date"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { infoActionSheet } from "@/utils/ActionSheets"

export default defineComponent({
    components: { HisStandardForm },
    data: () => ({
        apiDate: '' as string,
        fields: [] as Array<Field>,
    }),
    async created(){
        this.apiDate = await Service.getApiDate()
        this.fields = generateDateFields({
            id: 'session_date',
            helpText: 'Session Date',
            required: true,
            minDate: () => '2000-01-01',
            maxDate: () => this.apiDate,
            estimation: {
                allowUnknown: false
            },
            computeValue: (date: string) => date,
            config: {
                footerBtns: [
                    {
                        name: 'Reset',
                        slot: 'end',
                        color: 'success',
                        state: {
                            visible: {
                                default: () => Service.isBDE() 
                            }
                        },
                        onClick: async () => {
                            await this.resetSessionDate()
                        }
                    }
                ]
            }
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
                    { name: 'Reset Date', slot: 'start', color: 'success'},
                    { name: 'Keep BDE Date', slot: 'end', color: 'danger'},
                    { name: 'New date', slot: 'end'}
                ],
            )

            if (action === 'Reset Date') {
                return await this.resetSessionDate()
            }
            if (action === 'Keep BDE Date') {
                this.redirect()
            }
        },
        async resetSessionDate() {
            try {
                await Service.resetSessionDate()
                toastSuccess(`Session date has been reset to ${this.formatDate(this.apiDate)}`)
                this.redirect()
            } catch (e) {
                toastWarning(e)
            }
        },
        redirect() {
            const patientId = this.$route.query.patient_dashboard_redirection_id
            patientId 
                ? this.$router.push(`/patient/dashboard/${patientId}`)
                : this.$router.back()
        },
        async onSubmit(_: any, computedData: any) {
            const date = computedData.session_date
            try {
                await Service.setSessionDate(date)
                toastSuccess(`Successfully Back dated to ${this.formatDate(date)}`)
                this.redirect()
            } catch(e) {
                toastWarning(e)
            }
        },
        formatDate(date: string) {
            return HisDate.toStandardHisDisplayFormat(date)
        }
    }
})
</script>
