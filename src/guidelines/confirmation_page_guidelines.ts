/**
 * This guideline will manage popup reminders or actions
 * that are brought to a user's attention pertaining to 
 * a Patient's state.
*/
import { GuideLineInterface } from "@/utils/GuidelineEngine"
import { infoActionSheet } from "@/utils/ActionSheets"

export enum TargetEvent {
    ON_CONTINUE = 'oncontinue',
    ONLOAD = 'onload'
}

export enum FlowState {
    CONTINUE = 'continue',
    ENROLL = 'enroll',
    EXIT = 'exit',
    ACTIVATE_FN = 'activateFn',
    ASSIGN_NPID = 'assignNpid'
}

export const CONFIRMATION_PAGE_GUIDELINES: Record<string, GuideLineInterface> = {
    "Warn if patient is missing National ID and assign them one": {
        priority: 1,
        actions: {
            alert: async () => {
                await infoActionSheet(
                    'Missing National ID',
                    'Patient was found BUT has no National ID',
                    'The system is going to assign the patient with a new ID',
                    [
                        { 
                            name: 'Confirm', 
                            slot: 'start', 
                            color: 'primary'
                        }
                    ]
                )
                return FlowState.ASSIGN_NPID
            }
        },
        conditions: {
            identifiers: (identifiers: Array<string>) => identifiers.includes('National health ID')
        }
    },
    "Warn before proceeding if patient is deceased based on current Patient state": {
        priority: 1,
        targetEvent: TargetEvent.ON_CONTINUE,
        actions: {
            alert: async () => {
                const action = await infoActionSheet(
                    'Deceased Patient',
                    'Patient outcout is Died!',
                    'Do you want to continue?',
                    [
                        { 
                            name: 'Yes', 
                            slot: 'start', 
                            color: 'danger'
                        },
                        { 
                            name: 'No',  
                            slot: 'end', 
                            color: 'success'
                        }
                    ]
                )
                return action === 'Yes' ? FlowState.CONTINUE : FlowState.EXIT
            }
        },
        conditions: { 
            patientState: (state: string) => state === 'Patient died' 
        }
    },
    "Warn before proceeding if patient stopped treatment based on current Patient state": {
        priority: 1,
        targetEvent: TargetEvent.ON_CONTINUE,
        actions: {
            alert: async () => {
                const action = await infoActionSheet(
                    'Stopped Treatment',
                    'Patient outcome is Stopped Treatment ',
                    'Do you want to continue?',
                    [
                        { 
                            name: 'Yes', 
                            slot: 'start', 
                            color: 'danger'
                        },
                        { 
                            name: 'No',  
                            slot: 'end', 
                            color: 'success'
                        }
                    ]
                )
                return action === 'Yes' ? FlowState.CONTINUE : FlowState.EXIT
            }
        },
        conditions: {
            patientState: (state: string) => state === 'Treatment stopped' 
        }
    },
    "Warn before proceeding if patient is transferred out based on current patient state": {
        priority: 1,
        targetEvent: TargetEvent.ON_CONTINUE,
        actions: {
            alert: async () => {
                const action = await infoActionSheet(
                    'Transferredout Patient',
                    'Patient was transferred out',
                    'Do you want to continue?',
                    [
                        { 
                            name: 'Yes', 
                            slot: 'start', 
                            color: 'danger'
                        },
                        { 
                            name: 'No',  
                            slot: 'end', 
                            color: 'success'
                        }
                    ]
                )
                return action === 'Yes' ? FlowState.CONTINUE : FlowState.EXIT
            }
        },
        conditions: {
            patientState: (state: string) => state === 'Patient transferred out'
        }
    },
    "Ask to print Barcode if NPID changed": {
        priority: 4,
        targetEvent: TargetEvent.ONLOAD,
        conditions: {
            patientIdentifier: () => 
        }
    },
    "Prompt patient enrollment in current programme if not enrolled" : {
        priority: 2,
        targetEvent: TargetEvent.ONLOAD,
        actions: {
            alert: async () => {
                const action = await infoActionSheet(
                    'Programme Enrollment',
                    'Patient is not enrolled in current programme, do you want to enroll?',
                    '',
                    [
                        { 
                            name: 'Yes', 
                            slot: 'start', 
                            color: 'danger'
                        },
                        { 
                            name: 'No',  
                            slot: 'end', 
                            color: 'success'
                        }
                    ]
                )
                return action === 'Yes' ? FlowState.ENROLL : FlowState.EXIT
            }
        },
        conditions: {
            patientProgram: (program: string) => program === '' 
        }
    },
    "Prompt action when patient demographics are incomplete" : {
        priority: 3,
        targetEvent: TargetEvent.ONLOAD,
        conditions: {

        }
    },
    "(ART Filing numbers) Prompt dormant filing number reactivation if patient has a dormant filing number": {
        priority: 1,
        targetEvent: TargetEvent.ONLOAD,
        actions: {
            alert: async () => {
                const action = await infoActionSheet(
                    'Filing Numbers',
                    'Activate dormant #?',
                    '',
                    [
                        { 
                            name: 'Yes', 
                            slot: 'start', 
                            color: 'success'
                        },
                        { 
                            name: 'No',  
                            slot: 'end', 
                            color: 'danger'
                        }
                    ]
                )
                return action === 'Yes' ? FlowState.ACTIVATE_FN : FlowState.EXIT
            }
        },
        conditions: {
            patientProgram: (program: string) => program === 'HIV PROGRAM',
            filingNumber: (type: string) => type === 'Archived filing number'
        }
    },
    "(ART) Warn if Viral load is High": {
        priority: 3,
        targetEvent: TargetEvent.ONLOAD,
        actions: {
            alert: async () => {
                await infoActionSheet(
                    'Viral Laod',
                    'Patient has High viral load, please take action',
                    '',
                    [
                        { 
                            name: 'Ok', 
                            slot: 'start', 
                            color: 'danger'
                        }
                    ]
                )
                return FlowState.CONTINUE
            }
        },
        conditions: {
            patientProgram: (program: string) => program === 'HIV PROGRAM',
            viralLoad: (viralLoad: string) => viralLoad === 'High'
        }
    }
}
