import { TaskInterface } from "../../interfaces/TaskInterface"

export const PRIMARY_ACTIVITIES: TaskInterface[] = [
  {
    id: "order tests",
    name: "Order Tests",
    icon: "social_history.png",
    action: ({patient}: any, router: any) => {
      router.push(`/los/forms/order/${patient.patient_id}?type=ORDER_TESTS`)
    }
  },
  {
    id: "draw samples",
    name: "Draw Samples",
    icon: "hts.png",
    action: ({patient}: any, router: any) => {
      router.push(`/los/forms/order/${patient.patient_id}?type=DRAW_SAMPLES`)
    }
  }
]
