import { toastController, alertController, actionSheetController, modalController } from "@ionic/vue";
import ConfimationSheet from "@/components/DataViews/actionsheet/ConfirmationSheet.vue"

async function toast(message: string, color="primary", duration=10000) {
    const toast = await toastController.create({
        message: message,
        position: "top",
        animated: true,
        duration: duration,
        color: color,
        keyboardClose: true,
        buttons: [
            {
                side: 'end',
                icon: 'close',
                role: 'cancel'
            }
        ]
    });
    return toast.present();
}

export function toastWarning(message: string, duration=10000) {
    return toast(message, 'warning', duration)
}

export function toastSuccess(message: string, duration=1000) {
    return toast(message, 'success', duration)
}

export function toastDanger(message: string, duration=10000) {
    return toast(message, 'danger', duration)
}

export async function alertAction(message: string, buttons: any) {
    const alert = await alertController.create({
        cssClass: 'my-custom-class',
        mode: 'ios',
        message,
        backdropDismiss: false,
        buttons
    });

    alert.present();    
    const { role } = await alert.onDidDismiss()
    return role || ''
}

export async function actionSheet(header: string, subHeader: string, buttons: Array<string>) {
    const action = await actionSheetController.create({
        header,
        subHeader,
        mode: 'ios',
        backdropDismiss: false,
        buttons: buttons.map((i: any) => ({text: i, role: i.toLowerCase()}))
    })
    action.present()
    const { role } = await action.onDidDismiss();
    return role
}
export async function alertConfirmation(message: string, header="Confirmation") {
    const modal = await modalController.create({
        component: ConfimationSheet,
        backdropDismiss: false,
        cssClass: "small-modal",
        componentProps: {
            subtitle: header,
            body: message,
            actionButtons: [
                {
                    name: 'Cancel',
                    size: 'large',
                    slot: 'start',
                    color: 'danger',
                    visible: true,
                    role: 'Cancel',
                    onClick: ({role}: any) => modalController.dismiss(role)
                },
                {
                    name: 'Confirm',
                    size: 'large',
                    slot: 'end',
                    color: 'success',
                    visible: true,
                    role: 'Confirm',
                    onClick: ({role}: any) => modalController.dismiss(role)
                },
            ],
        }
    })
    modal.present()
    const { data } = await modal.onDidDismiss()
    return data === 'Confirm' 
}
