import { ProgramService } from "./program_service";
import { AppEncounterService } from "./app_encounter_service";
import { PrintoutService } from "@/services/printout_service"

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

    printTransferout() {
        const print = new PrintoutService()
        return print.printLbl(`/programs/${this.programId}/patients/${this.patientId}/labels/transfer_out`)    
    }
    async transferOutEncounter(facility: any) {
        const transferOut = new AppEncounterService(this.patientId, 119)
        const encounter = await transferOut.createEncounter()
        if (!encounter) {
            throw 'Unable to transfer out encounter'
        }
        return transferOut.saveValueTextObs('Transfer to', facility.name)
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
