/**
 * This guideline will manage popup reminders or actions
 * that are brought to a user's attention pertaining to 
 * a Patient's state.
 */
import { GuideLineInterface } from "@/utils/GuidelineEngine"

export enum TargetEvent {
    ON_CONTINUE = 'onload',
    ONLOAD = 'onload'
}

export const CONFIRMATION_PAGE_GUIDELINES: Record<string, GuideLineInterface> = {
    "Provide warning when proceeding with a deceased patient": {
        priority: 1,
        targetEvent: TargetEvent.ON_CONTINUE,
        conditions: {

        }
    },
    "Prompt patient enrollment in current programme if not enrolled" : {
        priority: 2,
        targetEvent: TargetEvent.ONLOAD,
        conditions: {

        }
    },
    "Prompt patient demographics confirmation" : {
        priority: 3,
        targetEvent: TargetEvent.ONLOAD,
        conditions: {

        }
    },
    "(ART Filing numbers) Prompt dormant filing number reactivation if patient has a dormant filing number": {
        priority: 1,
        targetEvent: TargetEvent.ONLOAD,
        conditions: {

        }
    },
    "(ART Filing numbers) Prompt to create filing number for patient who does'nt have one": {
        priority: 1,
        targetEvent: TargetEvent.ONLOAD,
        conditions: {

        }
    }
}