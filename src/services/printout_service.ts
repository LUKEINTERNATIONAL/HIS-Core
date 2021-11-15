import { Service } from "./service";
import { getPlatforms, modalController } from "@ionic/vue";
import ZebraPrinterComponent from "@/components/ZebraPrinterImage.vue"
import { delayPromise } from "@/utils/Timers";
import ApiClient from "./api_client";

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

    async printLbl(url: any) {
        PrintoutService.showPrinterImage()
        const isNative = getPlatforms().filter(p => [
            'android', 
            ].includes(p)).length >= 1
            if(!isNative) {

            document.location = (await ApiClient.expandPath(url)).url as any
            } 
        await delayPromise(3000)
        await modalController.dismiss({})
    }

    async printLocation(locationId: number) {
        await this.printLbl(`labels/location?location_id=${locationId}`)
    }
    async printDrug(drugId: number, quantity: number) {
        await this.printLbl(`drugs/${drugId}/barcode?quantity=${quantity}`)
    }
}