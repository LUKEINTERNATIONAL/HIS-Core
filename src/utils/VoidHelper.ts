import { alertConfirmation } from "@/utils/Alerts"
import { actionSheetController } from "@ionic/vue"

export async function voidWithReason(callback: Function) {
    const confirm = await alertConfirmation('Are you sure you want to void?')

    if (!confirm) {
        return
    }

    const actionSheet = await actionSheetController.create({
      header: 'Are you sure you want to void this Encounter?',
      subHeader: 'Please specify reason for voiding this encounter',
      mode: 'ios',
      buttons: [
        {
          text: 'Mistake/ Wrong Entry',
          role: 'Mistake/ Wrong Entry'
        },
        {
          text: 'Duplicate',
          role: 'Duplicate'
        },
        {
          text: 'System Error',
          role: 'System Error'
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ]
    })
    actionSheet.present()
    const { role } = await actionSheet.onDidDismiss();
    if (role != 'cancel') {
        callback(role)
    }
}
