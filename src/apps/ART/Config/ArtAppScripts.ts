import { modalController } from "@ionic/vue";
import ActivitiesModal from "@/components/ART/ActivitiesModal.vue";
import { PRIMARY_ACTIVITIES } from "./ArtProgramActivities";
import {TaskInterface} from "./../../interfaces/TaskInterface"

function getActivityOptions() {
    return PRIMARY_ACTIVITIES.map((activity: TaskInterface)=> {
        return {
            value: activity.name,
            selected: false
        }
    })
}

export async function init() {
    const modal = await modalController.create({
        component: ActivitiesModal,
        cssClass: "my-custom-class",
        backdropDismiss: false,
        componentProps: {
            activities: getActivityOptions()
        }
    });
    modal.present();
    return modal;
}
