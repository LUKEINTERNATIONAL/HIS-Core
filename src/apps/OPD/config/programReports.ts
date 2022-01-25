import { FolderInterface } from "@/apps/interfaces/AppInterface"

export const REPORTS: FolderInterface[] = [
    {
        name: 'MoH',
        icon: 'login-logos/Malawi-Coat_of_arms_of_arms.png',
        defaultFilesIcon: 'reports.png',
        condition: () => false,
        files: [
            {
                name: 'LA report',
                pathName: 'moh_la'
            },
            {
                name: 'Drug report',
                pathName: 'moh_drug'
            },
            {
                name: 'Malaria report',
                pathName: 'moh_malaria' 
            },
            {
                name: 'IPT',
                pathName: 'moh_ipt'
            }
        ]
    },
    {
        name: 'PEPFAR',
        icon: 'login-logos/PEPFAR.png',
        defaultFilesIcon: 'reports.png',
        condition: () => false,
        files: [
            {
                name: 'IDSR report',
                pathName: 'pepfar_idsr'
            },
            {
                name: 'DHIS 2',
                pathName: 'pepfar_dhis_2'
            },
        ]
    },
    {
        name: 'Clinic',
        icon: 'reports.png',
        defaultFilesIcon: 'reports.png',
        files: [
            {
                name: 'Diagnosis by address',
                pathName: 'clinic_diagnosis_by_address'
            },
            {
                name: 'Diagnosis',
                pathName: 'clinic_diagnosis'
            },
            {
                name: 'Registration report',
                pathName: 'clinic_registration'
            },
            {
                name: 'LA report',
                pathName: 'clinic_la'
            },
            {
                name: 'Cases seen report',
                pathName: 'clinic_cases_seen'
            },
            {
                name: 'Mental health report',
                pathName: 'clinic_mental_health'
            },
            {
                name: 'Drugs given',
                pathName: 'clinic_drugs_given'
            },
            {
                name: 'Drugs (prescribed and dispensed)',
                pathName: 'clinic_drugs'
            },
            {
                name: 'With NIDs',
                pathName: 'clinic_with_nids'
            },
        ]
    }
]