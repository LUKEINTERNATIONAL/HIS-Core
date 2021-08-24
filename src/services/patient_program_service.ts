import { ProgramService } from "./program_service";

export class PatientProgramService extends ProgramService {
    patientId: number
    programId: number
    stateId: number
    patientProgramId: number
    constructor(patientId: number) {
        super()
        this.patientId = patientId
        this.patientProgramId = -1
        this.programId = -1
        this.stateId = -1
    }

    getProgramId() {
        return this.programId
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
