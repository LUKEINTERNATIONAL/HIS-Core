import { WorkflowService } from "@/services/workflow_service"

export async function nextTask(patientID: number, router: any) {
   try {
        const { name } = await WorkflowService.nextTask(patientID)
        if (name) {
            router.push({
                name: name.toLowerCase(),
                params: { 'patient_id': patientID }
            })
            return
        }
   } catch (e) { console.warn(e) }
   router.push(`/patient/dashboard/${patientID}`)
}