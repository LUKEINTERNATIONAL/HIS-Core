import { FolderInterface } from "@/apps/interfaces/AppInterface"

export const REPORTS: FolderInterface[] = [
    {
        name: 'MoH',
        icon: 'login-logos/Malawi-Coat_of_arms_of_arms.png',
        files: [
            {
                name: 'Cohort',
                pathName: 'moh_cohort'
            },
            {
                name: 'Cohort / disaggregated',
                pathName: 'moh_disaggregated'
            },
            {
                name: 'Survival analysis',
                pathName: 'moh_survial_analysis' 
            },
            {
                name: 'TPT new initiations',
                pathName: 'moh_tpt_new_initiations'
            },
            {
                name: 'TX CURR MMD',
                pathName: 'moh_tx_curr_mmd'
            }
        ]
    },
    {
        name: 'Clinic',
        icon: 'reports.png',
        files: [
            {
                name: 'Defaulter list',
                pathName: 'clinic_defaulters_report'
            },
            {
                name: 'Regimen report',
                pathName: 'clinic_regimen_report'
            },
            {
                name: 'Lab results',
                pathName: 'clinic_lab_results'
            },
            {
                name: 'Regimen switch',
                pathName: 'clinic_regimen_switch'
            },
            {
                name: 'Clients due for VL',
                pathName: 'clinic_due_viral_load_report'
            },
            {
                name: 'External consultation clients',
                pathName: 'clinic_external_consultation_report'
            },
            {
                name: 'Retention report',
                pathName: 'clinic_retention_report'
            },
            {
                name: 'Pregnant Patient',
                pathName: 'clinic_pregnant_patients'
            },
            {
                name: 'Missed Appointment',
                pathName: 'clinic_missed_appointments'
            },
            {
                name: 'VL results',
                pathName: 'clinic_viral_load'
            },
            {
                name: 'Other outcome list',
                pathName: 'clinic_other_outcome_list'
            },
            {
                name: 'Regimns and Formulation',
                pathName: 'clinic_regimen_formulation'
            },
            {
                name: 'Appointments',
                pathName: 'clinic_appointments'
            },
            {
                name: 'Stock card report',
                pathName: 'stock_card_report'
            }
        ]
    },
    {
        name: 'PEPFAR',
        icon: 'login-logos/PEPFAR.png',
        files: [
            {
                name: 'Defaulter list',
                pathName: 'pepfar_defaulters_report'
            },
            {
                name: 'Disaggregated',
                pathName: 'pepfar_disaggregated_report'
            },
            {
                name: 'Regimen Report',
                pathName: 'pepfar_regimen_report'
            },
            {
                name: 'Regimen Switch',
                pathName: 'pepfar_regimen_switch'
            },
            {
                name: 'TB PREV',
                pathName: 'pepfar_tb_prev_report'
            },
            {
                name: 'TX CURR MMD',
                pathName: 'pepfar_tx_curr_mmd_report'
            },
            {
                name: 'TX ML',
                pathName: 'pepfar_tx_ml_report'
            },
            {
                name: 'TX RTT',
                pathName: 'pepfar_tx_rtt'
            }
        ]
    }
]