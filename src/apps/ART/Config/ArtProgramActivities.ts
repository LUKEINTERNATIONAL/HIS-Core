import { TaskInterface } from "../../interfaces/TaskInterface"
import { PatientPrintoutService } from "@/services/patient_printout_service"

export const PRIMARY_ACTIVITIES: TaskInterface[] = [
  {
    id: "art adherence",
    name: "ART adherence",
    icon: "adherence.png"
  },
  {
    id: "hiv clinic consultation",
    name: "HIV clinic consultations",
    icon: "consultation.png"
  },
  {
    id: "hiv clinic registration",
    name: "Hiv clinic registration",
    icon: "registration.png"
  },
  {
    id: "hiv reception",
    name: "HIV reception",
    icon: "reception.png"
  },
  {
    id: "hiv staging",
    name: "HIV staging",
    icon: "hiv-staging.png"
  },
  {
    id: "appointment",
    name: "Manage Appointments",
    icon: "appointment.png"
  },
  {
    id: "dispensing",
    name: "Drug Dispensations",
    icon: "dispensing.png"
  },
  {
    id: "treatment",
    name: "Treatment",
    icon: "prescription.png"
  },
  {
    id: "vitals",
    name: "Vitals",
    icon: "vitals.png"
  },
  {
    id: "patient type",
    name: "Patient Type",
    icon: "patient-type.png"
  },
  {
    id: "fast track assesment",
    name: "Fast Track assesment",
    icon: "fast-track.png"
  }
]

export const SECONDARY_ACTIVITIES: TaskInterface[] = [
  {
    id: "npid",
    name: "National Health ID (Print)",
    description: "Print Patient National Health ID",
    action({ patient }: any) {
      const lbl = new PatientPrintoutService(patient.patient_id)
      return lbl.printNidLbl()
    },
    icon: "barcode.png"
  },
  {
    id: "lab activities",
    name: "Lab activities",
    description: "Do lab orders",
    icon: 'lab.png'
  },
  {
    id: "demographics",
    name: "Demographics (Print)",
    description: "Print Patient Demographics",
    action: ({ patient }: any) => {
      const lbl = new PatientPrintoutService(patient.patient_id)
      return lbl.printDemographicsLbl()
    },
    icon: "print.png"
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
    icon: "print.png"
  },
  {
    id: "change_session_Date",
    name: "Change session date",
    description: "Change session date (for retrospective entry)",
    url: "/session/date",
    icon: "time.png"
  },
  {
    id: "program_management",
    name: "Program(s)",
    description: "View / update patient's programs",
    action: ({ patient }: any, router: any) => {
      router.push({ path: `/patient/programs/${patient.patient_id}`})
    },
    icon: "programs.png"
  },
  {
    id: "f_number",
    name: "Filing Number (Print)",
    description: "Print Patient Filing Number",
    action({ patient }: any) {
      const lbl = new PatientPrintoutService(patient.patient_id)
      return lbl.printFilingNumberLbl()
    },
    icon: "folder.png"
  },
  {
    id: "visit_summary",
    name: "Visit Summary (Print)",
    description: "Print Patient Visit Summary",
    action({ patient, visitDate }: any) {
      const lbl = new PatientPrintoutService(patient.patient_id)
      return lbl.printVisitSummaryLbl(visitDate)
    },
    icon: "folder.png"
  },
  {
    id: "master_card",
    name: "Mastercard",
    description: "Mastercard",
    action: ({ patient }: any, router: any) => {
      router.push({ path: `/art/mastercard/${patient.patient_id}`})
    },
    icon: "card.png"
  },
  {
    id: "enter_lab_result",
    name: "Enter Lab Result",
    description: "Enter Lab Test Result",
    action: ({ patient }: any, router: any) => {
      router.push({ path: `/lab/results/${patient.patient_id}`})
    },
    icon: "enter.png"
  },
  {
    id: "archive_client",
    name: "Archive client",
    description: "Archive a client",
    url: "/",
    icon: "archive.png"
  },
  {
    id: "assign_filing_number",
    name: "Assign filing number",
    description: "Assign a new filing number",
    url: "/",
    icon: "archive.png"
  },
  {
    id: "change_patient_type",
    name: "Change patient type",
    description: "Change patient type",
    url: "/",
    icon: "patient-type.png"
  }
]
