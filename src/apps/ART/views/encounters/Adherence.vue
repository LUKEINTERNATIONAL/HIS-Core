<template>
    <his-standard-form 
        :skipSummary="true" 
        :fields="fields" 
        :onFinishAction="onSubmit"
        :cancelDestinationPath="cancelDestination" 
    />
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import AdherenceMixinVue from './AdherenceMixin.vue'
export default defineComponent({
    mixins: [AdherenceMixinVue],
    watch: {
        patient: {
            async handler(patient: any) {
                await this.initAdherence(patient, this.providerID)
                this.fields = this.getAdherenceFields()
            },
            deep: true
        }
    },
    methods: {
        async onSubmit() {
            await this.saveAdherence()
            this.nextTask()
        }
    }
})
</script>
