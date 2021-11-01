import { TaskInterface } from "@/apps/interfaces/TaskInterface";

export const PRIMARY_ACTIVITIES: TaskInterface[] = [
  {
    id: 'vitals',
    name: 'Vitals',
    icon: 'vitals.png'
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
    icon: 'clinical-notes.png'
  },
  {
    id: 'lab results',
    name: 'Lab results',
    icon: 'clinical-notes.png'
  },
  {
    id: 'prescription',
    name: 'Prescription',
    icon: 'clinical-notes.png'
  },
  {
    id: 'dispensation',
    name: 'Dispensation',
    icon: 'dispensing.png'
  },
  {
    id: 'patient registration',
    name: 'Patient registration',
    icon: 'attributes.png'
  },
  {
    id: 'presenting complaints',
    name: 'Presenting complaints',
    icon: 'complaints.png'
  },
  {
    id: 'social history',
    name: 'Social history',
    icon: 'medical-report.png'
  },
  {
    id: 'drugs given',
    name: 'Drugs given',
    icon: 'drugs-given.png'
  }
]
