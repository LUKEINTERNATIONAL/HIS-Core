import { Service } from "./service";
import { modalController } from "@ionic/vue";
import ZebraPrinterComponent from "@/components/ZebraPrinterImage.vue"
import { toastWarning } from "@/utils/Alerts";

export class PrintoutService extends Service {
    constructor() {
        super()
    }

    static async showPrinterImage() {
        const modal = await modalController.create({
            component: ZebraPrinterComponent,
            backdropDismiss: false,
        })
        modal.present()
    }

    async printLbl(url: string, name=`printout-${Service.getSessionDate()}`) {
        PrintoutService.showPrinterImage()
        const file = await Service.getText(url)

        if (!file) {
            toastWarning('Unable to print barcode')
            return await modalController.dismiss({})
        } 

        const fileUrl = window.URL.createObjectURL(new Blob([file]))

        const link = document.createElement('a')
        link.href = fileUrl
        link.style.display = 'none'
        link.setAttribute('download', `${name}.lbl`)
        document.body.appendChild(link)

        link.click()
        document.body.removeChild(link);
        setTimeout(async () => await modalController.dismiss({}), 3000)
        return true
    }
}