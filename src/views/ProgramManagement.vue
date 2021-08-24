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
import { Field } from "@/components/Forms/FieldInterface"
import { toastWarning, toastSuccess } from "@/utils/Alerts"
import Validation from "@/components/Forms/validations/StandardValidations"
import { generateDateFields } from "@/utils/HisFormHelpers/MultiFieldDateHelper"
import { ProgramService } from "@/services/program_service"
import { PatientProgramService } from "@/services/patient_program_service"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";

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
                               () => {
                                   //TODO: Add void functionality here
                                   alert('Voided')
                               }
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
