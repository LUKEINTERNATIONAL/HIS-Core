import { TaskInterface } from "../../interfaces/TaskInterface"
import { PatientPrintoutService } from "@/services/patient_printout_service"
import { Patientservice } from "@/services/patient_service"

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
    globalProperty: 'enable_fast_track=true',
    icon: "fast-track.png"
  },
  {
    id: "BP management",
    name: "BP management",
    icon: "dispensing.png",
    globalProperty: 'activate.htn.enhancement=true'
  }
]

export const SECONDARY_ACTIVITIES: TaskInterface[] = [
  {
    id: "f_number",
    name: "Filing Number (Print)",
    description: "Print Patient Filing Number",
    globalProperty: 'use_filing_numbers=true',
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
    action: ({ patient }: any, router: any) => {
      router.push(`/art/filing_numbers/${patient.patient_id}?archive=true`)
    },
    condition: async ({ patient }: any) => {
      return new Patientservice(patient).hasActiveFilingNumber()
    },
    globalProperty: 'use_filing_numbers=true',
    icon: "archive.png"
  },
  {
    id: "assign_filing_number",
    name: "Assign filing number",
    description: "Assign a new filing number",
    condition: async ({patient}: any) => {
      const _p = new Patientservice(patient)
      return _p.hasDormantFilingNumber() || !_p.hasActiveFilingNumber()
    },
    action: ({ patient }: any, router: any) => {
      router.push(`/art/filing_numbers/${patient.patient_id}?assign=true`)
    },
    globalProperty: 'use_filing_numbers=true',
    icon: "archive.png"
  },
  {
    id: "filing_number_trail",
    name: "View filing number trail",
    description: "view trail",
    action: ({ patient }: any, router: any) => {
      router.push(`/art/filing_numbers/${patient.patient_id}?trail=true`)
    },
    globalProperty: 'use_filing_numbers=true',
    icon: "folder.png"
  },
  {
    id: "change_patient_type",
    name: "Change patient type",
    description: "Change patient type",
    url: "/",
    icon: "patient-type.png"
  }
]
