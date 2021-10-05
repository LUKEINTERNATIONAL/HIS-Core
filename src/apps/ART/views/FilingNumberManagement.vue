<template>
  <his-standard-form
    :skipSummary="true" 
    :activeField="fieldComponent"
    @onFinish="onFinish"
    @onIndex="fieldComponent=''"
    :fields="fields">
  </his-standard-form>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { isEmpty } from 'lodash';
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import { loadingController } from "@ionic/vue"
import { Patientservice } from '@/services/patient_service';
import { FilingNumberService } from '@/apps/ART/services/filing_number_service'
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { toastDanger } from '@/utils/Alerts';
import Validation from "@/components/Forms/validations/StandardValidations"
import { alertConfirmation } from "@/utils/Alerts"

export default defineComponent({
    components: { HisStandardForm },
    data: () => ({
        service: {} as any,
        patient: {} as any,
        fieldComponent: '' as string,
        fields: [] as Array<Field>,
        assignFilingNum: false as boolean,
    }),
    watch: {
        '$route': {
            async handler({query, params}: any) {
                if (params && params.patient_id) {
                    this.service = new FilingNumberService()
                    this.service.setPatientID(params.patient_id)
                    this.patient = await this.getPatient(params.patient_id)
                    await this.service.loadFilingPrefix()
                }
                if (query) {
                    if (query.archive === "true") {
                        await this.archiveFilingNumber()
                        return 
                    }
                    if (query.assign === "true") {
                       this.assignFilingNum = true
                    }
                    this.fields.push(this.getFilingNumberField())
                    this.fields.push(this.getCandidateSelectionField())
                }
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        onFinish() {
            this.$router.push(`/patient/dashboard/${this.service.getPatientID()}`)
        },
        async presentLoading(message="Please wait...") {
            const loading = await loadingController.create({
                message, backdropDismiss: false
            })
            await loading.present()
        },
        async getPatient(patientID: number): Promise<Record<string, number | string>> {
            const patient = await Patientservice.findByID(patientID)
            if (patient) {
                const _patient = new Patientservice(patient)
                return {
                    id: _patient.getID(),
                    filingID: _patient.getFilingNumber(),
                    name: `${_patient.getGivenName()} ${_patient.getFamilyName()}`
                }
            }
            return {}
        },
        async archiveFilingNumber() {
            await this.presentLoading('Archiving filing number')
            try {
                await this.service.archiveFilingNumber()
                await this.service.printFilingNumber()
            }catch(e) {
                toastDanger(e)
            }
            await loadingController.dismiss()
            this.$router.push(`/patient/dashboard/${this.service.getPatientID()}`)
        },
        getCandidateSelectionField(): Field {
            return {
                id: 'select_candidate_to_swap',
                type: FieldType.TT_SELECT,
                helpText: 'Filing Number (Archive)',
                validation: (val: Option) => Validation.required(val),
                onValue: async (val: Option) => {
                    if(val) {
                        const confirmed = await alertConfirmation(
                            `Are you sure you want to archive ${val.other.identifier}`
                        )

                        if (!confirmed) return false

                        const res = await this.service
                            .archivePatient(
                                val.value, val.other.identifier
                            )
                        if (res) {
                            this.patient = await this.getPatient(this.service.getPatientID())
                            this.fieldComponent = 'filing_number_management'
                            return true
                        }
                        return false
                    }
                    return true
                },
                options: async () => {
                    const candidates = await this.service.getArchivingCandidates()
                    return candidates.map((candidate: any) => ({
                        label: `${candidate.given_name} ${candidate.family_name} (${candidate.state})`,
                        value: candidate.patient_id,
                        other: candidate
                    }))
                }
            }
        },
        getFilingNumberField(): Field {
            return {
                id: "filing_number_management",
                type: FieldType.TT_FILING_NUMBER_VIEW,
                helpText: "Filing Number Management",
                condition: () => this.assignFilingNum,
                options: async () => {
                    // Simple object to track filing number identifiers
                    const assignment: any = {
                        primary: {
                            label: 'Dormant → Active',
                            value: this.patient.name,
                            other: {
                                activeNumber: this.patient.filingID || '', 
                                dormantNumber: 'N/A'
                            }
                        },
                        archived:  {
                            label: 'Active → Dormant',
                            value: 'N/A',
                            other: {
                                activeNumber: 'N/A', 
                                dormantNumber: 'N/A'
                            }
                        }
                    }
                    await this.presentLoading('Arranging filing numbers...')
                    // Avoidig reassigning filing number to patient who already has one.
                    // Not having this condition causes the backend to crash!!
                    if (!this.service.isActiveFilingNum(this.patient.filingID)) {
                        try {
                            const f = await this.service.assignFilingNumber()
                            assignment.primary
                                .other
                                .activeNumber = f.new_identifier.identifier
                            assignment.primary
                                .other
                                .dormantNumber = this.service
                                .isDormantFilingNum(this.patient.filingID) 
                                    ? this.patient.filingID
                                    : 'N/A'

                            loadingController.dismiss()

                            await this.service.printFilingNumber()

                            if (!isEmpty(f.archived_identifier)) {
                                const patient = await this.getPatient(
                                    f.archived_identifier.patient_id
                                )
                                assignment.secondary.value = patient.name
                                assignment.secondary
                                    .other
                                    .activeNumber = f.archived_identifier.identifier
                                assignment.secondary
                                    .other
                                    .dormantNumber = f.new_identifier.identifier
                            }
                        }catch(e) {
                            toastDanger('Unable to give filing number, try swapping with eligible candidate')
                            loadingController.dismiss()
                            this.fieldComponent = 'select_candidate_to_swap'
                        }
                    } else {
                        loadingController.dismiss()
                    }
                    return [ assignment.primary, assignment.archived ]
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
                            visibleOnStateChange: (state: any) => {
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
