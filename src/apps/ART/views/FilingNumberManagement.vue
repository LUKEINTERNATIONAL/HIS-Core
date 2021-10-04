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
    }),
    watch: {
        '$route': {
            async handler({query, params}: any) {
                if (params && params.patient_id) {
                    this.service = new FilingNumberService()
                    this.service.setPatientID(params.patient_id)
                }
                if (query) {
                    this.assignFilingNum = query.assign === "true"
                    this.fields.push(this.getFilingNumberField())
                }
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
        async getPatientName(patientID: number) {
            const patient = await Patientservice.findByID(patientID)
            if (patient) {
                return new Patientservice(patient).getFullName()
            }
            return ''
        },
        getFilingNumberField(): Field {
            return {
                id: "filing_number_management",
                type: FieldType.TT_FILING_NUMBER_VIEW,
                helpText: "Filing Number Management",
                condition: () => this.assignFilingNum,
                options: async () => {
                    await this.presentLoading('Arranging filing numbers...')
                    const res = await this.service.assignFilingNumber()
                    let primaryPatientName = ''
                    let secondaryPatientName = ''
                    let newPrimaryFilingNum = ''
                    let newSecondaryFilingNumber = ''
                    let dormantSecondaryFilingNumber = ''

                    await loadingController.dismiss()

                    if (!isEmpty(res)) {
                        if (res.new_identifier) {
                            primaryPatientName = await this.getPatientName(
                                res.new_identifier.patient_id
                            )
                            newPrimaryFilingNum = res.new_identifier.identifier
                            await this.service.printFilingNumber()
                        }
                        if (res.archived_identifier) {
                            secondaryPatientName = await this.getPatientName(
                                res.archived_identifier.patient_id
                            )
                            newSecondaryFilingNumber = res.archived_identifier.identifier
                            dormantSecondaryFilingNumber = newPrimaryFilingNum
                        }
                    }
                    return [
                        {
                            label: 'Dormant → Active',
                            value: primaryPatientName,
                            other: {
                                activeNumber: newPrimaryFilingNum, 
                                dormantNumber: ''
                            }
                        },
                        {
                            label: 'Active → Dormant',
                            value: secondaryPatientName,
                            other: {
                                activeNumber: newSecondaryFilingNumber, 
                                dormantNumber: dormantSecondaryFilingNumber
                            }
                        }
                    ]
                },
                config: {
                    hiddenFooterBtns: [
                        'Cancel',
                        'Clear'
                    ],
                    footerBtns: [
                        {
                            name: 'Print #',
                            size: 'large',
                            slot: 'start',
                            color: 'primary',
                            visible: true,
                            visibleOnStageChange: (state: any) => {
                                return state.field.id === 'filing_number_management'
                            },
                            onClick: async () => this.service.printFilingNumber()
                        }
                    ]
                }
            }
        }
    }
})
</script>
