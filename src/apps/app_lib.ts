import Apps from "@/apps/his_apps";
import ApplicationModal from "@/components/ApplicationModal.vue";
import { modalController } from "@ionic/vue";
import { find, isEmpty } from 'lodash';
import GlobalApp from "@/apps/GLOBAL_APP/global_app"

function getActiveApp() {
    const appName = sessionStorage.getItem('applicationName')

    if (appName) {
        const app: any = {...find(Apps, { applicationName: appName })}
        /**
         * Merge global configurations with app configurations
         */
        app.secondaryPatientActivites = [
            ...GlobalApp.GlobalProgramActivities,
            ...app.secondaryPatientActivites
        ]
        if (app.globalPropertySettings) {
            app.globalPropertySettings = [
                ...GlobalApp.GlobalAppSettings,
                ...app.globalPropertySettings
            ]
        } else {
            app.globalPropertySettings = GlobalApp.GlobalAppSettings
        }
        return app
    }
    return {}
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