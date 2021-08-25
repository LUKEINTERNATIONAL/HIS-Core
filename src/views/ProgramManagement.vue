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
import { EstimationFieldType, generateDateFields } from "@/utils/HisFormHelpers/MultiFieldDateHelper"
import { ProgramService } from "@/services/program_service"
import { PatientProgramService } from "@/services/patient_program_service"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { find, findIndex, isEmpty } from 'lodash'

export default defineComponent({
    components: { HisStandardForm },
    data: () => ({
        patient: {} as any,
        patientProgram: {} as any,
        fields: [] as Array<Field>,
        fieldComponent: '' as string,
        activeField: '' as string,
        activeProgram: {} as any,
        programSelectionFieldContext: {} as any
    }),
    watch: {
        fieldComponent(field: string){
            if (field) {
                this.activeField = field
            }
        },
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
            switch(this.activeField) {
                case 'program_enrollment':
                    await this.onEnrollProgram() 
                    break;
                case 'program_state':
                    await this.onProgramState()
                    break;
            }
        },
        async patientPrograms() {
            const programs = await this.patientProgram.getPrograms()
            return programs.map((p: any) => ({
                label: p.program.name,
                value: p.program.program_id,
                other: { ...p }
            }))
        },
        async allPrograms() {
            const hasPrograms = this.programSelectionFieldContext.listData
            const programs = await ProgramService.getAllPrograms()
            // Build programs while excluding already existing ones
            return programs.map((p: any) => ({
                                label: p.name,
                                value: p.program_id,
                                disabled: find(hasPrograms, { value: p.program_id }),
                                other: { ...p }
                            }))
        },
        async programWorkflows() {
            const workflows = await ProgramService.getProgramWorkflows(this.patientProgram.getProgramId())
            if (!isEmpty(workflows)) {
                const curStates = this.activeProgram ? this.activeProgram.patient_states : []
                const activeStates = curStates.filter((s: any) => s.end_date === null).map((s: any) => s.name)
                return workflows[0].states.map((s: any) => ({
                    label: s.name, 
                    value: s.program_workflow_state_id,
                    disabled: activeStates.includes(s.name),
                    other: { ...s }
                }))
            }
        },
        onUpdateState() {
            if (this.patientProgram.getProgramId() === -1) {
                return toastWarning('Please select a program')
            }
            this.fieldComponent = 'program_state'
        },
        async onProgramState() {
            try {
                await this.patientProgram.updateState()
                this.fieldComponent = 'program_selection'
                toastSuccess('State has been updated')
            } catch(e) {
                toastDanger(e)
            }
        },
        async onEnrollProgram() {
            const programId = this.patientProgram.getProgramId()
            if (programId === -1) {
                return toastWarning('Please select a program')
            }
            try {
                this.activeProgram = await this.patientProgram.enrollProgram()
                this.fieldComponent = 'program_state'
                toastSuccess('Patient has been enrolled!')
            }catch(e) {
                this.activeProgram = {}
                toastDanger(e)
            }
        },
        async onVoidState(state: any) {
            const comfirmation = await alertConfirmation(`Are you sure you want to void ${state.name}?`)
            if (comfirmation) {
                this.patientProgram.setStateId(state.patient_state_id)
                await this.patientProgram.voidState('i Shall add this later')
            }
            this.patientProgram.setStateId(-1)
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
                visibleOnStateChange: (state: any) => {
                    return state.index === fieldIndex
                }
            }
        },
        getFields(): Array<Field> {
            return [
                {
                    id: 'program_selection',
                    helpText: 'Programs',
                    type: FieldType.TT_PROGRAM_SELECTION,
                    onload: (context: any) => {
                        this.programSelectionFieldContext = context
                    },
                    onValue: (val: Option) => {
                        if (val) {
                            this.activeProgram = val.other
                            this.patientProgram.setProgramId(val.value)
                            this.patientProgram.setPatientProgramId(val.other.patient_program_id)
                        }
                        return true
                    },
                    validation: (val: any) => Validation.required(val),
                    options: () => this.patientPrograms(),
                    config: {
                       onVoidState: this.onVoidState,
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
                               this.onUpdateState
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
                    condition: () => this.activeField === 'program_enrollment',
                    unload: (val: Option) => this.patientProgram.setProgramId(val.value),
                    options: () => this.allPrograms(),
                    config: {
                        showKeyboard: true
                    }
                },
                ...generateDateFields({
                    id: 'program_outcome_date',
                    helpText: 'Outcome',
                    validation: (val: any) => Validation.required(val),
                    condition: () => this.activeField === 'program_enrollment',
                    estimation: {
                        allowUnknown: true,
                        estimationFieldType: EstimationFieldType.MONTH_ESTIMATE_FIELD
                    },
                    computeValue: (date: string) => this.patientProgram.setDate(date),
                }),
                {
                    id: "program_state",
                    helpText: "State",
                    type: FieldType.TT_SELECT,
                    options: () => this.programWorkflows(),
                    condition: () => this.activeField === 'program_state',
                    unload: (val: Option) => this.patientProgram.setStateId(val.value)
                },
                ...generateDateFields({
                    id: 'state_outcome_date',
                    helpText: 'State',
                    condition: (f: any) => f.program_state,
                    validation: (val: any) => Validation.required(val),
                    estimation: {
                        allowUnknown: true,
                        estimationFieldType: EstimationFieldType.MONTH_ESTIMATE_FIELD
                    },
                    computeValue: (date: string) => this.patientProgram.setDate(date)
                })
            ]
        }
    }
})
</script>
