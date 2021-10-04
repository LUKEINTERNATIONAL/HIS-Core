<template>
  <his-standard-form
    :skipSummary="true" 
    :fields="fields">
  </his-standard-form>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { FilingNumberService } from '@/apps/ART/services/filing_number_service'
import { loadingController } from "@ionic/vue"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { isEmpty } from 'lodash';
import { Field } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';

export default defineComponent({
    components: { HisStandardForm },
    data: () => ({
        service: {} as any,
        patient: -1 as number,
        fields: [] as Array<Field>,
        newFilingNumber: '' as string,
        archivedFilingNumber: '' as string
    }),
    watch: {
        '$route': {
            async handler({query, params}: any) {
                if (params && params.patient_id) {
                    this.service = new FilingNumberService()
                    this.service.setPatientID(params.patient_id)
                }
                if (query) {
                    if (query.assign === "true") {
                       await this.assignFilingNumber()
                    }
                }
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        async assignFilingNumber() {
            await this.presentLoading('Please wait, arranging filing numbers...')
            const res = await this.service.assignFilingNumber()
            if (!isEmpty(res.new_identifier)) {
                this.newFilingNumber = res.new_identifier.identifier
                this.fields.push(this.getFilingNumberField())
            }
            await loadingController.dismiss()
        },
        async presentLoading(message="Please wait...") {
            const loading = await loadingController.create({ 
                message, backdropDismiss: false 
            })
            await loading.present()
        },
        getFilingNumberField(): Field {
            return {
                id: "filing_number_management",
                type: FieldType.TT_FILING_NUMBER_VIEW,
                helpText: "Filing Number Management",
                options: () => {
                    return [
                        {
                            label: 'Dormant → Active',
                            value: '',
                            other: {
                                activeNumber: this.newFilingNumber, 
                                dormantNumber: ''
                            }
                        },
                        {
                            label: 'Active → Dormant',
                            value: '',
                            other: {
                                activeNumber: '', 
                                dormantNumber: ''
                            }
                        }
                    ]
                }
            }
        }
    }
})
</script>
