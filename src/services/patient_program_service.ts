import { ProgramService } from "./program_service";

export class PatientProgramService extends ProgramService {
    patientId: number
    programId: number
    stateId: number
    patientProgramId: number
    programDate: string
    stateDate: string
    constructor(patientId: number) {
        super()
        this.patientId = patientId
        this.patientProgramId = -1
        this.programId = -1
        this.stateId = -1
        this.programDate = ''
        this.stateDate = ''
    }

    getProgramId() {
        return this.programId
    }

    getStateDate() {
        return this.stateDate
    }

    getProgramDate() {
        return this.programDate
    }

    getPatientProgramId() {
        return this.patientProgramId
    }

    getPrograms() {
        return ProgramService.getPatientPrograms(this.patientId)
    }

    getProgramStates() {
        return ProgramService.getPatientStates(this.patientId, this.programId)
    }

    voidProgram(reason: string) {
        return ProgramService.voidProgram(this.patientProgramId, reason)
    }

    voidState(reason: string) {
        return ProgramService.voidState(this.patientId, this.programId, this.stateId, reason)
    }

    enrollProgram() {
        return ProgramService.enrollProgram(this.patientId, this.programId, this.programDate)
    }

    updateState() {
        return ProgramService.createState(this.patientId, this.programId, {
            state: this.stateId, date: this.stateDate
        })
    }

    setProgramDate(date: string) {
        this.programDate = date
    }

    setStateDate(date: string) {
        this.stateDate = date
    }

    setPatientProgramId(id: number) {
        this.patientProgramId = id
    }

    setProgramId(program: number) {
        this.programId = program
    }

    setStateId(state: number) {
        this.stateId = state
    }
}
