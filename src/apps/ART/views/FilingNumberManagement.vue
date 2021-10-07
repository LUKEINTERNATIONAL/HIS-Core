<template>
  <his-standard-form
    :skipSummary="true" 
    :activeField="fieldComponent"
    @onIndex="fieldComponent=''"
    :fields="fields">
  </his-standard-form>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { isEmpty } from 'lodash';
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import { loadingController, modalController } from "@ionic/vue"
import { Patientservice } from '@/services/patient_service';
import { FilingNumberService } from '@/apps/ART/services/filing_number_service'
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations"
import { alertConfirmation, toastDanger, toastWarning  } from "@/utils/Alerts"
import HisDate from "@/utils/Date"
import Keypad from "@/components/Keyboard/HisKeypad.vue"
import { WorkflowService } from "@/services/workflow_service"

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
        /**
         * Initiates service and Detects parameters 
         * in the url and switch to appropriate actions
         */
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
                    if (query.trail === "true") {
                       this.fieldComponent = 'view_filing_history'
                    }
                    this.fields.push(this.getFilingNumberField())
                    this.fields.push(this.getCandidateSelectionField())
                    this.fields.push(this.getFilingNumberHistoryField())
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
        async filingNumberSearchKeypad() {
            const modal = await modalController.create({
                component: Keypad,
                backdropDismiss: false,
                cssClass: 'keypad-modal',
                componentProps: {
                    title: 'Find dormant',
                    strictNumbers: false,
                    onKeyPress: () => {
                        //TODO: do nothing!
                    }
                }
            })
            await modal.present()
            const { data } = await modal.onDidDismiss()
            return data
        },
        async getArchivingCandidates(pageNumber=0): Promise<Option[]> {
            const candidates = await this.service.getArchivingCandidates(pageNumber)
            return this.formatCandidateOptions(candidates)
        },
        formatCandidateOptions(candidates: Array<any>): Option[] {
            return candidates.map((candidate: any) => ({
                label: `${candidate.given_name} ${candidate.family_name} (${candidate.state})`,
                value: candidate.identifier,
                other: {
                    data: candidate,
                    list: [
                        {
                            label: 'Filing #',
                            value: candidate.identifier,
                            style: {
                                color: 'green', 
                                fontWeight: 'bold'
                            }
                        },
                        {
                            label: 'Name',
                            value: `${candidate.given_name} ${candidate.family_name}`
                        },
                        {
                            label: 'Outcome',
                            value: candidate.state
                        },
                        {
                            label: 'LAD',
                            value: HisDate.toStandardHisDisplayFormat(
                                candidate.appointment_date
                            )
                        }
                    ]   
                }
            }))
        },
        getFilingNumberHistoryField(): Field {
            return {
                id: 'view_filing_history',
                type: FieldType.TT_TABLE_VIEWER,
                helpText: 'Filing Number Trail',
                options: async () => {
                    const columns = ['Status', 'Filing #', 'Date Created', 'Date voided', 'Action']
                    const data = await this.service.getPastFilingNumbers()
                    const rows = data.map((d: any) => ([
                        d.voided === 1 ? 'Voided' : 'Active',
                        d.identifier,
                        HisDate.toStandardHisDisplayFormat(d.date_created),
                        HisDate.toStandardHisDisplayFormat(d.date_voided),
                        ''
                    ]))
                    return [
                        {
                            label: 'Filing Number Trail',
                            value: 'Trail',
                            other: { columns, rows }
                        }
                    ]
                },
                config: {
                    hiddenFooterBtns: [
                        'Clear',
                        'Next',
                        'Back',
                        'Finish'
                    ],
                    footerBtns: [
                        {
                            name: 'Get filing #',
                            onClick: () => {
                                this.fieldComponent = 'filing_number_management'
                            }
                        }
                    ]
                }
            }
        },
        getCandidateSelectionField(): Field {
            // Keeps track of the component object that's presented on the screen
            let selectorInstance: any = {}
            // Candidate list is paginated, tracking page here
            let pageNumber = 0
            let filingNumbeSearchTerm = ''
            // Restore point for archived candidates
            let filingOptionsBackup: Option[] = []

            return {
                id: 'select_candidate_to_swap',
                type: FieldType.TT_CARD_SELECTOR,
                helpText: 'Filing Number (Archive)',
                validation: (val: Option) => Validation.required(val),
                onload: (instance: any) => {
                    selectorInstance = instance
                },
                onValue: async (val: Option) => {
                    if(val) {
                        const confirmed = await alertConfirmation(
                            `Are you sure you want to archive ${val.value}`
                        )

                        if (!confirmed) {
                            return false
                        }

                        const res = await this.service
                            .archivePatient(
                                val.other.data.patient_id, val.value
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
                options: () => this.getArchivingCandidates(),
                config: {
                    hiddenFooterBtns: [
                        'Clear',
                        'Back',
                        'Finish',
                        'Next'
                    ],
                    footerBtns: [
                        /**
                         * Resets listData to previous state after a search term was triggerred.
                         * Note: Only visible when users searches filing numbers
                         */
                        {
                            name: 'Reset',
                            slot: 'end',
                            color: 'warning',
                            state: {
                                visible: {
                                    default: () => filingNumbeSearchTerm ? true : false 
                                }
                            },
                            onClick: () => {
                                // Clear values and restore previous listData prior to search 
                                // results
                                filingNumbeSearchTerm = ''
                                selectorInstance.listData = filingOptionsBackup
                                filingOptionsBackup = []
                            }
                        },
                        /**
                         * Loads a key pad for searching for a filing candidate
                         */
                        {
                            name: 'Specify',
                            slot: 'end',
                            color: 'success',
                            onClick: async () => {
                                filingNumbeSearchTerm = await this.filingNumberSearchKeypad()
                                if (filingNumbeSearchTerm) {
                                    const filingNumbers = await this.service.getFilingNumber(
                                        filingNumbeSearchTerm
                                    )
                                    // Create a restore point for archived candidates
                                    filingOptionsBackup = [...selectorInstance.listData]
                                    selectorInstance.listData = this.formatCandidateOptions(filingNumbers)
                                }
                            }
                        },
                        /**
                         * List pagination button that decrements the page number.
                         * Note: this button will only appear when no filing number were manually searched.
                         * It will also appear when pageNumber is greater than 1
                         */
                        {
                            name: 'Previous batch',
                            slot: 'end',
                            state: {
                                visible: {
                                    default: () => !filingNumbeSearchTerm
                                },
                                disabled: {
                                    default: () => pageNumber <= 0 
                                }
                            },
                            onClick: async () => {
                                pageNumber -= 1
                                selectorInstance.listData = await this.getArchivingCandidates(pageNumber)
                            }
                        },
                        /**
                         * List pagination button that increments the page number.
                         * Note: this button will only appear when no filing number were manually searched
                         * and if the list has 10 or more items
                         */
                        {
                            name: 'Next batch',
                            slot: 'end',
                            state: {
                                visible: {
                                    default: () => !filingNumbeSearchTerm
                                },
                                disabled: {
                                    default: () => {
                                        return selectorInstance.listData 
                                        && selectorInstance.listData.length <= 1
                                        
                                    }
                                }
                            },
                            onClick: async () => {
                                pageNumber += 1
                                selectorInstance.listData = await this.getArchivingCandidates(pageNumber)
                            }
                        }
                    ]
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

                            loadingController.dismiss()
                            /**
                             * Go to candidate selector screen if the request was empty
                             */
                            if (isEmpty(f)) {
                                this.fieldComponent = 'select_candidate_to_swap'
                                toastWarning('Out of filing numbers, Please select eligible candidate')
                                return []
                            }

                            assignment.primary
                                .other
                                .activeNumber = f.new_identifier.identifier
                            assignment.primary
                                .other
                                .dormantNumber = this.service
                                .isDormantFilingNum(this.patient.filingID) 
                                    ? this.patient.filingID
                                    : 'N/A'

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
                            toastDanger(e)
                            loadingController.dismiss()
                        }
                    } else {
                        loadingController.dismiss()
                    }
                    await this.service.printFilingNumber()
                    return [ assignment.primary, assignment.archived ]
                },
                config: {
                    hiddenFooterBtns: [
                        'Cancel',
                        'Clear',
                        'Next'
                    ],
                    footerBtns: [
                        {
                            name: 'Print #',
                            slot: 'start',
                            onClick: async () => this.service.printFilingNumber()
                        },
                        {
                            name: 'Continue',
                            color: 'success',
                            slot: 'end',
                            onClick: async () => {
                                const nextTask = await WorkflowService.getNextTaskParams(
                                    this.service.getPatientID()
                                )
                                this.$router.push(nextTask)
                            }
                        }
                    ]
                }
            }
        }
    }
})
</script>
