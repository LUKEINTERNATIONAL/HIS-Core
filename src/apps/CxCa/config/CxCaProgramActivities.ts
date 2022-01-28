import { TaskInterface } from "../../interfaces/TaskInterface"

export const PRIMARY_ACTIVITIES: TaskInterface[] = [
  {
    id: "cxca test",
    name: "cxca test",
    workflowID: "cxca test",
    icon: "via-test.png"
  }, 
  {
    id: "cxca screening result",
    name: "cxca screening result",
    workflowID: "cxca screening result",
    icon: "first-aid-kit.png"
  },
  {
    id: "cxca treatment",
    name: "cxca treatment",
    workflowID: "cxca treatment",
    icon: "cancer.png"
  },
  {
    id: "cxca referral feedback",
    name: "cxca referral feedback",
    workflowID: "cxca referral feedback",
    icon: "referral.png"
  },
  {
    id: "appointment",
    name: "Manage Appointments",
    workflowID: "Manage Appointments",
    icon: "appointment.png"
  },
  // {
  //   id: "draw samples",
  //   name: "Draw Samples",
  //   icon: "social_history.png",
  //   action: ({patient}: any, router: any) => {
  //     router.push(`/los/forms/order/${patient.patient_id}?type=DRAW_SAMPLES`)
  //   }
  // }
]
