import Apps from "@/apps/his_apps";
import ApplicationModal from "@/components/ApplicationModal.vue";
import { modalController } from "@ionic/vue";
import { find, isEmpty } from 'lodash';
import GlobalApp from "@/apps/GLOBAL_APP/global_app"
import { AppInterface } from "./interfaces/AppInterface";

/**
* Merge global configurations with app configurations
*/
function applyGlobalConfig(app: AppInterface) {
    const _app = {...app}
    _app.secondaryPatientActivites = [
        ...GlobalApp.GlobalProgramActivities,
        ..._app.secondaryPatientActivites
    ]
    if (_app.globalPropertySettings) {
        _app.globalPropertySettings = [
            ...GlobalApp.GlobalAppSettings,
            ..._app.globalPropertySettings
        ]
    } else {
        _app.globalPropertySettings = GlobalApp.GlobalAppSettings
    }
    return _app
}

function getActiveApp(): AppInterface | undefined {
    const appName = sessionStorage.getItem('applicationName')

    if (appName) {
        const app: AppInterface | undefined = find(Apps, { applicationName: appName })
        if (app) return applyGlobalConfig(app)
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

    const app: AppInterface = applyGlobalConfig(data)
    
    if (app.init) await app.init()
    
    sessionStorage.setItem('applicationName', app.applicationName)

    return app
}
export default {
    selectApplication,
    getActiveApp
}