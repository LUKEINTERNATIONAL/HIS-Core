import { ProgramService } from "./program_service";
import { AppEncounterService } from "./app_encounter_service";
import { PrintoutService } from "@/services/printout_service"
import { isEmpty } from "lodash";

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
        this.programId = ProgramService.getProgramID()
        this.stateId = -1
        this.programDate = ProgramService.getSessionDate()
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
    /**
     * Get Patient program information by Session Program ID
     * @returns 
     */
    async getProgram() {
        const defaults = { program: 'Not available', outcome: 'Not available' }
        const req = await this.getPrograms()
        if (isEmpty(req)) {
            return defaults
        }
        /**
         * Filter programs by sessionID
         */
        const programs = req.filter((p: any) => {
            return p.program.program_id === ProgramService.getProgramID()
        }).map((p: any) => {
            /**
             * Find active state/outcome by checking if the 
             * end_date is empty
             */
            const availableStates = p.patient_states.filter(
                (s: any) => s.end_date === null
            )
            const outcome = isEmpty(availableStates) 
                ? 'N/A' 
                : availableStates[0].name 
            return {
                program: p.program.name, outcome
            }
        })
        return !isEmpty(programs) 
            ? programs[0] 
            : defaults
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
