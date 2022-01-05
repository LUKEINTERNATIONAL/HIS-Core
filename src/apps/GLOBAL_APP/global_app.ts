import { PatientPrintoutService } from "@/services/patient_printout_service"
import { UserService } from "@/services/user_service"
import { GLOBAL_PROP } from "./global_prop"

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
      condition: () => UserService.isAdmin(),
      files: [
        {
          name: "Portal settings",
          pathUrl: "/portal/config",
        }
      ]
    },
    {
      name: 'Network',
      icon: 'portal.png',
      condition: () => UserService.isAdmin(),
      files: [
        {
          name: "IP Configuration",
          pathUrl: "/settings/host",
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
          condition: () => UserService.isAdmin(),
          pathUrl:"/location/update/site",
        },
        {
          name: "Set Site Code",
          condition: () => UserService.isAdmin(),
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
          condition: () => UserService.isAdmin(),
          pathUrl: "/user?activity=add",
        },
        {
          name: "Edit Users",
          condition: () => UserService.isAdmin(),
          pathUrl: "/user?activity=edit",
        },
        {
          name: 'Change Password',
          pathUrl: '/user?activity=edit&update_password=true'
        },
        {
          name: 'System usage report',
          pathUrl: '/users/usage',
          condition: () => UserService.isAdmin()
        }
      ]
    },
    {
      name: 'Data Management',
      icon: 'list.png',
      condition: () => UserService.isAdmin(),
      files: [
        {
          name: "View Duplicates",
          pathUrl: '/view_duplicates'
        },
        {
          name: "Data Cleaning",
          pathUrl: "/data_cleaning",
        },
        {
          name: "Merge patients",
          pathUrl: "/patients/merge",
        },
        {
          name: "Patient visit stats",
          pathUrl: "/art/patient_visits"
        }
      ]
    },
    {
      name: 'DDE Settings', 
      icon: 'programs.png',
      condition: () => UserService.isAdmin(),
      files: [
        {
          name: "DDE Activation",
          pathUrl: `/preferences?label=Activate DDE&property=${GLOBAL_PROP.DDE_ENABLED}`
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