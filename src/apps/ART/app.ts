import { Option } from "@/components/Forms/FieldInterface";
import { ENCOUNTERS } from "./tasks/encounters";
import { OTHER_TASKS, PREFERENCES } from "./tasks/other";
import { AppInterface } from "../interfaces/AppInterface";
import PatientAlerts from "@/services/patient_alerts";
import appRoutes from "./routes"
import {BasePrefernceComponents} from '@/apps/ART/preferences'
const BASE_URL_PATH = '/assets/images/'

function img(image: string) { return `${BASE_URL_PATH}${image}` }

const ART: AppInterface = {
    programID: 1,
    applicationName: 'ART',
    applicationIcon: img('aids.png'),
    applicationDescription: "Application for HIV testing",
    appRoutes,
    patientDashboard: {
        tasks: {
            encounters: ENCOUNTERS,
            other: OTHER_TASKS
        },
        async alerts(patientId: number): Promise<Option[]> {
            const sideEffects = await PatientAlerts.alertSideEffects(patientId)
            return [
                { label: `Patient has ${sideEffects.length} side effects`, value: ''}
            ]
        },
        programCardInfo(data: any): Array<Option> {
            return  [
                { label: "ART- Start Date", value: data.art_start_date},
                { label: "ARV Number", value: `${data.arv_number} | Regimen: ${data.current_regimen}` },
                { label: "File Number", value: data.filing_number.number},
                { label: "Current Outcome", value: data.current_outcome},
            ]
        }
    },
    activities: [
        { value: "ART adherence", selected: false },
        { value: "HIV clinic consultations", selected: false },
        { value: "HIV first visits", selected: false },
        { value: "HIV reception visits", selected: false },
        { value: "HIV staging visits", selected: false },
        { value: "Manage Appointments", selected: false },
        { value: "Drug Dispensations", selected: false },
        { value: "Prescriptions", selected: false },
        { value: "Vitals", selected: false },
        { value: "Patient Type", selected: false }
    ],
    reports:[
        {
            name: 'MoH',
            icon: img('login-logos/Malawi-Coat_of_arms_of_arms.png'),
            files: [
                {
                    name: 'Cohort / disaggregated',
                    icon: img('reports.png'),
                    pathUrl: '/art/report/launcher/quarterly?report=moh_disaggregated'
                },
                {
                    name: 'Survival analysis',
                    icon: img('reports.png'),
                    pathUrl: '/art/report/launcher/dateinterval?report=moh_survial_analysis' 
                },
                {
                    name: 'TPT new initiations',
                    icon: img('reports.png'),
                    pathUrl: '/art/report/launcher/dateinterval?report=moh_tpt_new_initiations'
                },
                {
                    name: 'TX CURR MMD',
                    icon: img('reports.png'),
                    pathUrl: '/art/report/launcher/dateinterval?report=moh_tx_curr_mmd'
                }
            ]
        },
        {
            name: 'Clinic',
            icon: img('reports.png'),
            files: [
                {
                    name: 'Defaulter list',
                    icon: img('reports.png'),
                    pathUrl: '/art/report/launcher/dateinterval?report=clinic_defaulters_report'
                },
                {
                    name: 'Regimen report',
                    icon: img('reports.png'),
                    pathUrl: '/art/report/launcher/dateinterval?report=clinic_regimen_report'
                },
                {
                    name: 'Regimen switch',
                    icon: img('reports.png'),
                    pathUrl: '/art/report/launcher/dateinterval?report=clinic_regimen_switch'
                },
                {
                    name: 'Clients due for VL',
                    icon: img('reports.png'),
                    pathUrl: '/art/report/launcher/dateinterval?report=clinic_due_viral_load_report'
                },
                {
                    name: 'External consultation clients',
                    icon: img('reports.png'),
                    pathUrl: '/art/report/launcher/dateinterval?report=clinic_external_consultation_report'
                },
                {
                    name: 'Retention report',
                    icon: img('reports.png'),
                    pathUrl: '/art/report/launcher/dateinterval?report=clinic_retention_report'
                },
                {
                    name: 'Pregnant Patient',
                    icon: img('reports.png'),
                    pathUrl: '/art/report/launcher/dateinterval?report=clinic_pregnant_patients'
                },
                {
                    name: 'Missed Appointment',
                    icon: img('reports.png'),
                    pathUrl: '/art/report/launcher/dateinterval?report=clinic_missed_appointments'
                },
                {
                    name: 'VL results',
                    icon: img('reports.png'),
                    pathUrl: '/art/report/launcher/vl?report=clinic_viral_load'
                },
                {
                    name: 'Other outcome list',
                    icon: img('reports.png'),
                    pathUrl: '/art/report/launcher/outcome?report=clinic_other_outcome_list'
                },
                {
                    name: 'Regimns and Formulation',
                    icon: img('reports.png'),
                    pathUrl: '/art/report/launcher/regimen_formulation?report=clinic_regimen_formulation'
                }
            ]
        },
        {
            name: 'PEPFAR',
            icon: img('login-logos/PEPFAR.png'),
            files: [
                {
                    name: 'Defaulter list',
                    icon: img('reports.png'),
                    pathUrl: '/art/report/launcher/dateinterval?report=pepfar_defaulters_report'
                },
                {
                    name: 'Disaggregated',
                    icon: img('reports.png'),
                    pathUrl: '/art/report/launcher/dateinterval?report=pepfar_disaggregated_report'
                },
                {
                    name: 'Regimen Report',
                    icon: img('reports.png'),
                    pathUrl: '/art/report/launcher/dateinterval?report=pepfar_regimen_report'
                },
                {
                    name: 'Regimen Switch',
                    icon: img('reports.png'),
                    pathUrl: '/art/report/launcher/dateinterval?report=pepfar_regimen_switch'
                },
                {
                    name: 'TB PREV',
                    icon: img('reports.png'),
                    pathUrl: '/art/report/launcher/dateinterval?report=pepfar_tb_prev_report'
                },
                {
                    name: 'TX CURR MMD',
                    icon: img('reports.png'),
                    pathUrl: '/art/report/launcher/dateinterval?report=pepfar_tx_curr_mmd_report'
                },
                {
                    name: 'TX ML',
                    icon: img('reports.png'),
                    pathUrl: '/art/report/launcher/dateinterval?report=pepfar_tx_ml_report'
                },
                {
                    name: 'TX RTT',
                    icon: img('reports.png'),
                    pathUrl: '/art/report/launcher/dateinterval?report=pepfar_tx_rtt'
                }
            ]
        }
    ],
    preferences: PREFERENCES,
    preferenceComponents: BasePrefernceComponents

}
export default ART 