import { FolderInterface } from "@/apps/interfaces/AppInterface";

export const PROPERTIES: FolderInterface[] = [
    {
        name: "Drug Management",
        files: [
            {
                name: "Enter Receipts",
                pathUrl: "/",
            },
            {
                name: "Enter Product relocation/Disposal",
                pathUrl: "/",
            },
            {
                name: "Enter verified physical stock count",
                pathUrl: "/",
            },
            {
                name: "Print Barcode",
                pathUrl: "/",
            },
            {
                name: "Audit Trail",
                pathUrl: "/",
            }
        ]
    },
    {
        name: 'System Preferences',
        files: [
            {
                name: "Ask pills remaining at home",
                pathUrl: "ask_pills_remaining_at_home"
            },
            {
                name: "Activate Filing Numbers",
                pathUrl: "use_filing_numbers"
            },
            {
                name: "Activate extended labs",
                pathUrl: "extended_labs"
            },
            {
                name: "Activate drug management",
                pathUrl: "activate_drug_management"
            },
            {
                name: "Activate Hypertension screening",
                pathUrl: "activate.htn.enhancement"
            },
            {
                name: "Activate fast track",
                pathUrl: "ask_pills_remaining_at_home"
            },
            {
                name: "Activate 3HP auto select",
                pathUrl: "activate_3hp_auto_select"
            },
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