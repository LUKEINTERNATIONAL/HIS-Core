import Apps from "@/apps/his_apps";
import ApplicationModal from "@/components/ApplicationModal.vue";
import { modalController } from "@ionic/vue";
import { find, isEmpty } from 'lodash';

function getActiveApp() {
    const appName = sessionStorage.getItem('applicationName')

    if (appName) {
        return find(Apps, { applicationName: appName })
    }
}

async function selectApplication() {
    const modal = await modalController.create({
        component: ApplicationModal,
        cssClass: "large-modal",
        backdropDismiss: false
    });

    modal.present()

    const { data } = await modal.onDidDismiss()

    if (!data || isEmpty(data)) return

    if (data.init) await data.init()

    sessionStorage.setItem('applicationName', data.applicationName)

    return data
}
export default {
    selectApplication,
    getActiveApp
}