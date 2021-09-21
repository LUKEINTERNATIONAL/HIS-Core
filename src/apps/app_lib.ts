import Apps from "@/apps/his_apps";
import ApplicationModal from "@/components/ApplicationModal.vue";
import ActivitiesModal from "@/components/ART/ActivitiesModal.vue";
import OrdersModal from "@/components/ART/OrdersModal.vue";
import { modalController } from "@ionic/vue";
import { ActivityInterface } from './interfaces/AppInterface';
import { find, isEmpty } from 'lodash';

function getActiveApp() {
    const appName = sessionStorage.getItem('applicationName')

    if (appName) {
        return find(Apps, { applicationName: appName })
    }
}

function openModal(component: any, props = {}, cssClass = "large-modal") {
    return modalController.create({
        component,
        cssClass: cssClass,
        backdropDismiss: false,
        componentProps: { ...props }
    });
}

async function selectTasks(activities: Array<ActivityInterface>) {
    const modal = await openModal(ActivitiesModal, {activities})
    modal.present();
    return modal;
}

async function selectApplication() {
    const modal = await openModal(ApplicationModal)

    modal.present()

    const { data } = await modal.onDidDismiss()

    if (!data || isEmpty(data)) return

    const activities = await selectTasks(data.activities)

    await activities.onDidDismiss()

    sessionStorage.setItem('applicationName', data.applicationName)

    return data
}
async function makeLabOrders() {
    const modal = await openModal(OrdersModal, {}, "custom-modal")
    modal.present()
    return modal;
    // const { data } = await modal.onDidDismiss()
   
}
export default {
    selectApplication,
    getActiveApp,
    makeLabOrders
}