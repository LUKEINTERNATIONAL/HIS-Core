import { PatientPrintoutService } from "@/services/patient_printout_service"

export default {
  GlobalAppSettings: [
    {
      name: 'Session Management',
      icon: 'time.png',
      files: [
        {
          name: 'Change session date',
          pathUrl: '/session/date'
        }
      ]
    },
    {
      name: 'Portal Settings',
      icon: 'portal.png',
      files: [
        {
          name: "Portal settings",
          pathUrl: "/portal/config",
        }
      ]
    },
    {
      name: 'Location',
      icon: 'location.png',
      files: [
        {
          name: "Print Location",
          pathUrl: "/print/location",
        },
        {
          name: "Set Site Location",
          pathUrl:"/location/update/site",
        },
        {
          name: "Set Site Code",
          pathUrl:"/location/update/code",
        }
      ]
    },
    {
      name: 'User management',
      icon: 'edit-user.png',
      files: [
        {
          name: "New user",
          pathUrl: "/user?activity=add",
        },
        {
          name: "Edit Users",
          pathUrl: "/user?activity=edit",
        },
        {
          name: 'Change Password',
          pathUrl: '/user?activity=edit&update_password=true'
        },
        {
          name: 'System usage report',
          pathUrl: '/users/usage'
        },
      ]
    },
    {
      name: 'Data Management',
      icon: 'list.png',
      files: [
        {
          name: "Data Cleaning",
          pathUrl: "/data_cleaning",
        },
        {
          name: "Merge patients",
          pathUrl: "/patients/merge",
        }
      ]
    }
  ],
  GlobalProgramActivities: [
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
      id: "enter_lab_result",
      name: "Enter Lab Result",
      description: "Enter Lab Test Result",
      action: ({ patient }: any, router: any) => {
        router.push({ path: `/lab/results/${patient.patient_id}`})
      },
      icon: "enter.png"
    },
  ]
}