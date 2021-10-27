/**
 * This guideline will manage popup reminders or actions
 * that are brought to a user's attention pertaining to 
 * a Patient's state.
*/
import { GuideLineInterface } from "@/utils/GuidelineEngine"
import { infoActionSheet } from "@/utils/ActionSheets"
import { isEmpty } from "lodash"

export enum TargetEvent {
    ON_CONTINUE = 'oncontinue',
    ONLOAD = 'onload'
}

export enum FlowState {
    FORCE_EXIT = 'forceExit',
    CONTINUE = 'continue',
    ENROLL = 'enroll',
    EXIT = 'exit',
    ACTIVATE_FN = 'activateFn',
    ASSIGN_NPID = 'assignNpid',
    UPDATE_DMG = 'updateDemographics'
}

export const CONFIRMATION_PAGE_GUIDELINES: Record<string, GuideLineInterface> = {
    "Warn if patient is missing National ID and assign them one": {
        priority: 1,
        targetEvent: TargetEvent.ONLOAD,
        actions: {
            alert: async () => {
                await infoActionSheet(
                    'Missing National ID',
                    'Patient was found BUT has no National ID',
                    'The system is going to assign the patient with a new ID',
                    [
                        { 
                            name: 'OK', 
                            slot: 'start', 
                            color: 'primary'
                        }
                    ]
                )
                return FlowState.ASSIGN_NPID
            }
        },
        conditions: {
            identifiers: (ids: string[]) => !ids.includes('National id')
        }
    },
    "Warn before proceeding if patient is deceased based on current Patient state": {
        priority: 1,
        targetEvent: TargetEvent.ON_CONTINUE,
        actions: {
            alert: async () => {
                const action = await infoActionSheet(
                    'Deceased Patient',
                    'Patient outcome is Died!',
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
                return action === 'Yes' ? FlowState.CONTINUE : FlowState.FORCE_EXIT
            }
        },
        conditions: { 
            currentOutcome: (outcome: string) => outcome === 'Patient died' 
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
                return action === 'Yes' ? FlowState.CONTINUE : FlowState.FORCE_EXIT
            }
        },
        conditions: {
            currentOutcome: (outcome: string) => outcome === 'Treatment stopped' 
        }
    },
    "Warn before proceeding if patient is transferred out based on current patient state": {
        priority: 1,
        targetEvent: TargetEvent.ON_CONTINUE,
        actions: {
            alert: async () => {
                const action = await infoActionSheet(
                    'Transferred out Patient',
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
                return action === 'Yes' ? FlowState.CONTINUE : FlowState.FORCE_EXIT
            }
        },
        conditions: {
            currentOutcome: (outcome: string) => outcome === 'Patient transferred out'
        }
    },
    "Prompt patient enrollment in current programme if not enrolled" : {
        priority: 1,
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
                            color: 'success'
                        },
                        { 
                            name: 'No',  
                            slot: 'end', 
                            color: 'danger'
                        }
                    ]
                )
                return action === 'Yes' ? FlowState.ENROLL : FlowState.EXIT
            }
        },
        conditions: {
            programName: (name: string) => name.match(/n\/a/i) ? true : false
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
            programName: (programName: string) => programName === 'HIV PROGRAM',
            identifiers: (identifiers: string[]) => identifiers.includes('Archived filing number'),
            currentOutcome: (outcome: string) => ![
                'Treatment stopped', 
                'Patient transferred out', 
                'Patient died'
            ].includes(outcome),
            globalProperties({useFilingNumbers}: Record<string, boolean>) {
                return useFilingNumbers
            }
        }
    },
    "Prompt the user to update patient demographics when data is incomplete": {
        priority: 2,
        targetEvent: TargetEvent.ONLOAD,
        actions: {
            alert: async () => {
                const action = await infoActionSheet(
                    'Demographics',
                    'Patient data is incomplete data',
                    'Do you want to review and update now?',
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
                    ])
                return action === 'Yes' ? FlowState.UPDATE_DMG : FlowState.EXIT
            }
        },
        conditions: {
            demographics: (data: Record<string, any>) => {
                const demo = {...data}
                delete demo['landmark']
                const checks = Object.values(demo)
                    .map((d: any) => isEmpty(d) || d.match(/n\/a/i))
                return checks.some(Boolean)
            }
        }
    },
    "(ART) Warn if Viral load is High": {
        priority: 3,
        targetEvent: TargetEvent.ONLOAD,
        actions: {
            alert: async () => {
                await infoActionSheet(
                    'Viral Load',
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
            programName: (programName: string) => programName === 'HIV PROGRAM',
            viralLoadStatus: (viralLoadStatus: string) => viralLoadStatus === 'High'
        }
    }
}
