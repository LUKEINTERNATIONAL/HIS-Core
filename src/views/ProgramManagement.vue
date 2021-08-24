<template>
    <his-standard-form 
        @onIndex="fieldComponent=''"
        :activeField="fieldComponent"
        :skipSummary="true"
        :fields="fields"
        @onFinish="onFinish"
    />
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Field, Option } from "@/components/Forms/FieldInterface"
import { toastWarning, toastSuccess, toastDanger, alertConfirmation } from "@/utils/Alerts"
import Validation from "@/components/Forms/validations/StandardValidations"
import { generateDateFields } from "@/utils/HisFormHelpers/MultiFieldDateHelper"
import { ProgramService } from "@/services/program_service"
import { PatientProgramService } from "@/services/patient_program_service"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { findIndex } from 'lodash'

export default defineComponent({
    components: { HisStandardForm },
    data: () => ({
        patient: {} as any,
        patientProgram: {} as any,
        fields: [] as Array<Field>,
        fieldComponent: '' as any,
        programSelectionFieldContext: {} as any,
    }),
    watch: {
        '$route': {
            async handler({params}: any) {
                if (params && params.patient_id) {
                    this.patient = params.patient_id
                    this.patientProgram = new PatientProgramService(this.patient)
                    this.fields = this.getFields()
                }
            },
            deep: true,
            immediate: true
        }
    },
    methods: {
        async onFinish() {
            // TODO: do something
        },
        async patientPrograms() {
            const programs = await this.patientProgram.getPrograms()
            return programs.map((p: any) => ({
                label: p.program.name,
                value: p.program.program_id,
                other: { ...p }
            }))
        },
        async onVoidProgram() {
            const patientProgramId = this.patientProgram.getPatientProgramId()

            if (patientProgramId === -1) {
                return toastWarning('Please select a program')
            }
  
            const confirm = await alertConfirmation(`Are you sure you want to void program?`)

            if (!confirm) return

            try {
                await this.patientProgram.voidProgram('Will add soon')

                const fieldContext = this.programSelectionFieldContext
                const programIndex = findIndex(fieldContext.listData, { value: this.patientProgram.getProgramId() })

                fieldContext.listData.splice(programIndex)

                this.patientProgram.setPatientProgramId(-1)
                this.patientProgram.setProgramId(-1)
                toastSuccess('Program removed')
            } catch(e) {
                console.error(e)
                toastDanger(e)
            }
        },
        programNavButton(name: string, color: string, onClick: Function, fieldIndex=0) {
            return {
                name,
                color,
                size: 'large',
                slot: 'end',
                visible: true,
                onClick: onClick,
                visibleOnStageChange: (state: any) => {
                    return state.index === fieldIndex
                }
            }
        },
        getFields(): Array<Field> {
            return [
                {
                    id: 'program_selection',
                    helpText: 'Programs',
                    type: FieldType.TT_SELECT,
                    onload: (context: any) => {
                        this.programSelectionFieldContext = context
                    },
                    onValue: async (val: Option) => {
                        this.patientProgram.setPatientProgramId(val.other.patient_program_id)
                        this.patientProgram.setProgramId(val.value)
                        return true
                    },
                    validation: (val: any) => Validation.required(val),
                    options: () => this.patientPrograms(),
                    config: {
                       hiddenFooterBtns: [
                           'Clear',
                           'Finish',
                           'Next',
                           'Back'
                       ],
                       footerBtns: [
                           this.programNavButton(
                               'Void program',
                               'danger',
                               this.onVoidProgram
                           ),
                           this.programNavButton(
                               'Update state',
                               'primary',
                               () => {
                                   this.fieldComponent = 'program_state'
                               }
                           ),
                           this.programNavButton(
                               'Enroll',
                               'success',
                               () => {
                                   this.fieldComponent = 'program_enrollment'
                               }
                           )
                       ] 
                    }
                },
                {
                    id: "program_enrollment",
                    helpText: "Please select a programme",
                    type: FieldType.TT_SELECT,
                    options: () => [],
                },
                ...generateDateFields({
                    id: 'program_outcome_date',
                    helpText: 'Outcome',
                    validation: (val: any) => Validation.required(val),
                    estimation: {
                        allowUnknown: false
                    },
                    computeValue: (date: string, isEstimate: boolean) => {
                        return {
                            date,
                            isEstimate
                        }
                    }
                }),
                {
                    id: "program_state",
                    helpText: "State",
                    type: FieldType.TT_SELECT,
                    options: () => [],
                },
                ...generateDateFields({
                    id: 'state_outcome_date',
                    helpText: 'State',
                    validation: (val: any) => Validation.required(val),
                    estimation: {
                        allowUnknown: false
                    },
                    computeValue: (date: string, isEstimate: boolean) => {
                        return {
                            date,
                            isEstimate
                        }
                    }
                })
            ]
        }
    }
})
</script>
