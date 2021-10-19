import { TaskInterface } from "../../interfaces/TaskInterface"
import { PatientPrintoutService } from "@/services/patient_printout_service"

export const PRIMARY_ACTIVITIES: TaskInterface[] = [
  {
    id: "art adherence",
    name: "ART adherence",
    workflowID: "ART adherence",
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
    workflowID: "HIV first visits",
    icon: "registration.png"
  },
  {
    id: "hiv reception",
    name: "HIV reception",
    workflowID: "HIV reception visits",
    icon: "reception.png"
  },
  {
    id: "hiv staging",
    name: "HIV staging",
    workflowID: "HIV staging visits",
    icon: "hiv-staging.png"
  },
  {
    id: "appointment",
    name: "Manage Appointments",
    workflowID: "Manage Appointments",
    icon: "appointment.png"
  },
  {
    id: "dispensing",
    name: "Drug Dispensations",
    workflowID: "Drug Dispensations",
    icon: "dispensing.png"
  },
  {
    id: "treatment",
    name: "Treatment",
    workflowID: "Prescriptions",
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
