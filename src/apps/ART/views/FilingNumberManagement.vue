<template>
  <his-standard-form
    :skipSummary="true" 
    :fields="fields">
  </his-standard-form>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { isEmpty } from 'lodash';
import { Field } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import { loadingController } from "@ionic/vue"
import { Patientservice } from '@/services/patient_service';
import { FilingNumberService } from '@/apps/ART/services/filing_number_service'
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";

export default defineComponent({
    components: { HisStandardForm },
    data: () => ({
        service: {} as any,
        patient: -1 as number,
        fields: [] as Array<Field>,
        assignFilingNum: false as boolean,
        primaryPatientName: '' as string
    }),
    watch: {
        '$route': {
            async handler({query, params}: any) {
                if (params && params.patient_id) {
                    const patient = await Patientservice.findByID(params.patient_id)
                    this.primaryPatientName = new Patientservice(patient).getFullName()
                    this.service = new FilingNumberService()
                    this.service.setPatientID(params.patient_id)
                }
                if (query) {
                    this.assignFilingNum = query.assign === "true"
                }
                this.fields.push(this.getFilingNumberField())
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
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
                condition: () => this.assignFilingNum,
                options: async () => {
                    await this.presentLoading('Please wait, arranging filing numbers...')
                    const res = await this.service.assignFilingNumber()
                    await loadingController.dismiss()
                    let newFilingNum = ''
                    let oldFilingNum = ''

                    if (!isEmpty(res)) {
                        newFilingNum = !isEmpty(res.new_identifier)
                            ? res.new_identifier.identifier
                            : ''
                        oldFilingNum = !isEmpty(res.archived_identifier)
                            ? res.archived_identifier.identifier
                            : ''
                    }
                    return [
                        {
                            label: 'Dormant → Active',
                            value: this.primaryPatientName,
                            other: {
                                activeNumber: newFilingNum, 
                                dormantNumber: oldFilingNum
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
