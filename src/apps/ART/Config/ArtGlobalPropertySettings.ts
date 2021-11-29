import { FolderInterface } from "@/apps/interfaces/AppInterface";
import { UserService } from "@/services/user_service"

function globalPropConfig(label: string, prop: string) {
    return {
        name: label,
        pathUrl: `/preferences?label=${label}&property=${prop}`
    }
}

export const PROPERTIES: FolderInterface[] = [
    {
        name: "Drug Management",
        icon: "drug.png",
        condition: () => UserService.isAdmin(),
        files: [
            {
                name: "Enter Receipts",
                pathUrl: "/art/stock/enter",
            },
            {
                name: "Enter Product relocation/Disposal",
                pathUrl: "/art/stock/move",
            },
            {
                name: "Enter verified physical stock count",
                pathUrl: "/art/stock/verify",
            },
            {
                name: "Print Barcode",
                pathUrl: "/drug/print",
            },
            {
                name: "Audit Trail",
                pathUrl: "/art/stock/trail",
            }
        ]
    },
    {
        name: 'System Preferences',
        icon: 'hiv-staging.png',
        condition: () => UserService.isAdmin(),
        files: [
            globalPropConfig(
                'Activate Extended Lab',
                'extended_labs'
            ),
            globalPropConfig(
                'Activate VL routine check',
                'activate_vl_routine_check'
            ),
            globalPropConfig(
                "Ask pills remaining at home", 
                "ask_pills_remaining_at_home"
            ),
            globalPropConfig(
                "Activate Filing Numbers", 
                "use.filing.number"
            ),
            globalPropConfig(
                "Activate drug management", 
                "activate.drug.management"
            ),
            globalPropConfig(
                "Activate Hypertension screening", 
                "activate.htn.enhancement"
            ),
            globalPropConfig(
                "Activate fast track", 
                "enable_fast_track"
            ),
            globalPropConfig(
                "Activate 3HP auto select",
                "activate_3hp_auto_select"
            ),
            globalPropConfig(
                "Filing numbers (activate)",
                "use.filing.numbers"
            ),
            globalPropConfig(
                "Is this a military site?",
                "military_site"
            ),
            {
                name: "Set Clinic Days",
                pathUrl: "/art/preferences/clinic_days"
            },
            {
                name: "Set HTN Age",
                pathUrl: "/art/preferences/htn_age"
            },
            {
                name: "Set Appointment Limit",
                pathUrl: "/art/preferences/appointment/limit"
            },
            {
                name: "Set Filing Numbers Limit",
                pathUrl: "/art/preferences/fn/limit"
            }
        ]
    }
]