import { TaskInterface } from "../../interfaces/TaskInterface"
import { PatientPrintoutService } from "@/services/patient_printout_service"
import { FieldType } from "../preferences"
import { FilingNumberService } from "../services/filing_number_service"

const BASE_URL_PATH = '/assets/images/'

function img(image: string) { return `${BASE_URL_PATH}${image}` }

export const OTHER_TASKS: Array<TaskInterface> = [
  {
    id: "npid",
    name: "National Health ID (Print)",
    description: "Print Patient National Health ID",
    action({ patient }: any) {
      const lbl = new PatientPrintoutService(patient.patient_id)
      return lbl.printNidLbl()
    },
    icon: img("barcode.png")
  },
  {
    id: "lab activities",
    name: "Lab activities",
    description: "Do lab orders",
    icon: img('lab.png')
  },
  {
    id: "demographics",
    name: "Demographics (Print)",
    description: "Print Patient Demographics",
    action: ({ patient }: any) => {
      const lbl = new PatientPrintoutService(patient.patient_id)
      return lbl.printDemographicsLbl()
    },
    icon: img("print.png")
  },
  {
    id: "demographics_edit",
    name: "Demographics (Edit)",
    description: "Edit Patient Demographics",
    action: ({ patient }: any, router: any) => {
      router.push({
        path: '/patient/registration', 
        query: { 'edit_person': patient.patient_id }
      })
    },
    icon: img("print.png")
  },
  {
    id: "change_session_Date",
    name: "Change session date",
    description: "Change session date (for retrospective entry)",
    url: "/session/date",
    icon: img("time.png")
  },
  {
    id: "program_management",
    name: "Program(s)",
    description: "View / update patient's programs",
    action: ({ patient }: any, router: any) => {
      router.push({ path: `/patient/programs/${patient.patient_id}`})
    },
    icon: img("programs.png")
  },
  {
    id: "f_number",
    name: "Filing Number (Print)",
    description: "Print Patient Filing Number",
    action({ patient }: any) {
      const lbl = new PatientPrintoutService(patient.patient_id)
      return lbl.printFilingNumberLbl()
    },
    icon: img("folder.png")
  },
  {
    id: "visit_summary",
    name: "Visit Summary (Print)",
    description: "Print Patient Visit Summary",
    action({ patient, visitDate }: any) {
      const lbl = new PatientPrintoutService(patient.patient_id)
      return lbl.printVisitSummaryLbl(visitDate)
    },
    icon: img("folder.png")
  },
  {
    id: "master_card",
    name: "Mastercard",
    description: "Mastercard",
    action: ({ patient }: any, router: any) => {
      router.push({ path: `/art/mastercard/${patient.patient_id}`})
    },
    icon: img("card.png")
  },
  {
    id: "enter_lab_result",
    name: "Enter Lab Result",
    description: "Enter Lab Test Result",
    action: ({ patient }: any, router: any) => {
      router.push({ path: `/lab/results/${patient.patient_id}`})
    },
    icon: img("enter.png")
  },
  {
    id: "archive_client",
    name: "Archive client",
    description: "Archive a client",
    action: ({ patient }: any, router: any) => {
      router.push(`/art/filing_numbers/${patient.patient_id}?archive=true`)
    },
    condition: async (p: any) => {
      const f: any = new FilingNumberService()
      try {
        const filingNum = p.program.filing_number.number
        if (filingNum != "N/A") {
          await f.loadFilingPrefix()
          const dormantPrx = f.getDormantPrx()
          if (dormantPrx && filingNum.match(new RegExp(dormantPrx), 'i')) {
            return false
          }
        }
      }catch(e) {
        console.error(e)
      }
      return true
    },
    icon: img("archive.png")
  },
  {
    id: "assign_filing_number",
    name: "Assign filing number",
    description: "Assign a new filing number",
    condition: async (p: any) => {
      const f: any = new FilingNumberService()
      try {
        const filingNum = p.program.filing_number.number
        if (filingNum != "N/A") {
          await f.loadFilingPrefix()
          const dormantPrx = f.getDormantPrx()
          if (dormantPrx 
            && !(filingNum.match(
                  new RegExp(dormantPrx), 'i'))
              ) {
            return false
          }
        }
      }catch(e) {
        console.error(e)
      }
      return true
    },
    action: ({ patient }: any, router: any) => {
      router.push(`/art/filing_numbers/${patient.patient_id}?assign=true`)
    },
    icon: img("archive.png")
  },
  {
    id: "change_patient_type",
    name: "Change patient type",
    description: "Change patient type",
    url: "/",
    icon: img("patient-type.png")
  }
]
export const PREFERENCES = {
        'Drug Management': [
          {
            name: "Enter Receipts",
            component: FieldType.TT_SET_SITE_CODE,
          },
          {
            name: "Enter Product relocation/Disposal",
            component: FieldType.TT_SET_SITE_CODE,
            route: "/",
          },
          {
            name: "Enter verified physical stock count",
            component: FieldType.TT_SET_SITE_CODE,
            route: "/",
          },
          {
            name: "Print Barcode",
            component: FieldType.TT_SET_SITE_CODE,
            route: "/",
          },
          {
            name: "Audit Trail",
            component: FieldType.TT_SET_SITE_CODE,
            route: "/",
          },
        ],
        'User Management': [
          {
            name: "New user",
            route: "/user?activity=add",
          },
          {
            name: "Edit Users",
            route: "/user?activity=edit",
          },
          {
            name: 'System usage report',
            route: '/users/usage'
          }
        ],
        'System Preferences': [
          {
            name: "Ask pills remaining at home",
            value: "ask_pills_remaining_at_home"
          },
          {
            name: "Activate Filing Numbers",
            value: "use_filing_numbers"
          },
          {
            name: "Activate extended labs",
            value: "extended_labs"
          },
          {
            name: "Activate drug management",
            value: "activate_drug_management"
          },
          {
            name: "Activate Hypertension screening",
            value: "activate.htn.enhancement"
          },
          {
            name: "Activate fast track",
            value: "ask_pills_remaining_at_home"
          },
          {
            name: "Is this a military site",
            value: "military.enabled"
          },
          {
            name: "Activate 3HP auto select",
            value: "activate_3hp_auto_select"
          },
          {
            component: FieldType.TT_SET_CLINC_DAY,
            name: "Set Clinic Days",
          },
          {
            component: FieldType.TT_SET_HTN_AGE,
            name: "Set HTN Age",
          },
          {
            component: FieldType.TT_SET_APPOINTMENT_LIMIT,
            name: "Set Appointment Limit",
          },
          {
            component: FieldType.TT_SET_SITE_CODE,
            name: "Set Site Code",
          },
          {
            component: FieldType.TT_SET_FILING_NUMBERS_LIMIT,
            name: "Set Filing Numbers Limit",
          },
          {
            component: FieldType.TT_SET_SITE_LOCATION,
            name: "Set Site Location",
          },
        ],
        'Location': [
          {
            name: "Print Location",
            route: "/print/location",
          },
        ],
        'Portal settings': [
          {
            name: "Portal settings",
            route: "/portal/config",
          },
        ],
        'Data Management': [
          {
            name: "Data Cleaning",
            route: "/data_cleaning",
          },
          {
            name: "Merge patients",
            route: "/patients/merge",
          }
        ]
      }