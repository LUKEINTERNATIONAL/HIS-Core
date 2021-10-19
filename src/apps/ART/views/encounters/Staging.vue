<template>
    <his-standard-form :skipSummary="true" :cancelDestinationPath="cancelDestination" :fields="fields" :onFinishAction="onSubmit"/>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import StagingMixin from "@/apps/ART/views/encounters/StagingMixin.vue"
import { toastWarning, toastSuccess } from "@/utils/Alerts"

export default defineComponent({
    mixins: [StagingMixin],
    watch: {
        patient: {
            async handler(patient: any){
                if (patient) {
                    await this.initStaging(patient)
                    this.fields = [...this.getStagingFields(), this.getStagingSummaryField()]
                }
            },
            deep: true
        }
    },
    methods: {
        async onSubmit(f: any, computedValues: any) {
            await this.submitStaging(computedValues)
            toastSuccess('Staging information has been saved')
            this.nextTask()
        }
    }
})
</script>
