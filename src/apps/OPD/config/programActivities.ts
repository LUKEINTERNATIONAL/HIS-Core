import { TaskInterface } from "@/apps/interfaces/TaskInterface";

export const PRIMARY_ACTIVITIES: TaskInterface[] = [
  {
    id: 'patient registration',
    name: 'Patient registration',
    icon: 'attributes.png'
  },
  {
    id: 'vitals',
    name: 'Vitals',
    icon: 'vitals.png'
  },
  {
    id: 'presenting complaints',
    name: 'Presenting complaints',
    icon: 'complaints.png'
  },
  {
    id: 'hiv status',
    name: 'HIV STatus',
    icon: 'aids.png'
  },
  {
    id: 'outpatient diagnosis',
    name: 'Outpatient diagnosis',
    icon: 'diagnosis.png'
  },
  {
    id: 'outcome status',
    name: 'Outcome status',
    icon: 'outcomes.png'
  },
  {
    id: 'lab orders',
    name: 'Lab orders',
    icon: 'clinical-notes.png',
    action: ({patient}: any, router: any) => {
      router.push(`/los/forms/order/${patient.patient_id}?type=DRAW_SAMPLES`)
    }
  },
  {
    id: 'lab results',
    name: 'Lab results',
    icon: 'enter.png',
    action: ({ patient }: any, router: any) => {
      router.push({ path: `/lab/results/${patient.patient_id}`})
    },
  },
  {
    id: 'social history',
    name: 'Social history',
    icon: 'medical-report.png'
  },
  {
    id: 'prescription',
    name: 'Prescription',
    icon: 'drugs-given.png'
  },
  {
    id: 'dispensation',
    name: 'Dispensation',
    icon: 'dispensing.png'
  },
]
