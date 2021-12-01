import TableSheet from "@/components/DataViews/actionsheet/TableActionSheet.vue"
import InfoSheet from "@/components/DataViews/actionsheet/InfoActionSheet.vue"
import ButtoneSheet from "@/components/DataViews/actionsheet/ButtonActionSheet.vue"
import ListSheet from "@/components/DataViews/actionsheet/InfoListActionSheet.vue"
import { modalController } from "@ionic/vue";

export async function tableActionSheet(
    title: string,
    subtitle: string,
    columns: Array<string>,
    rows: Array<string>,
    actionButtons: Array<any>,
    color = '',
    rowColors:  Array<any>=[])
    {
        const modal = await modalController.create({
        component: TableSheet,
        backdropDismiss: false,
        cssClass: "action-sheet-modal",
        componentProps: {
            title,
            subtitle,
            columns,
            rows,
            rowColors,
            actionButtons,
            color
        }
        })
        modal.present()
        const { data } = await modal.onDidDismiss()
        return data.action
    }

export async function listActionSheet(
    title: string,
    subtitle: string,
    list: Array<string>,
    actionButtons: Array<any>,
    color = '')
    {
        const modal = await modalController.create({
        component: ListSheet,
        backdropDismiss: false,
        cssClass: "action-sheet-modal",
        componentProps: {
            title,
            subtitle,
            actionButtons,
            list,
            color
        }
        })
        modal.present()
        const { data } = await modal.onDidDismiss()
        return data.action
    }

export async function infoActionSheet(
    title: string, 
    bodyTitle: string,
    bodyText: string,
    actionButtons: Array<any>,
    color = '')
    {
        const modal = await modalController.create({
        component: InfoSheet,
        backdropDismiss: false,
        cssClass: "action-sheet-modal",
        componentProps: {
            title,
            bodyTitle,
            bodyText,
            actionButtons,
            color
        }
        })
        modal.present()
        const { data } = await modal.onDidDismiss()
        return data.action
    }

export async function optionsActionSheet(
    title: string, 
    subtitle: string, 
    list: Array<string>, 
    actionButtons: Array<any>,
    color = '')
    {
        const modal = await modalController.create({
        component: ButtoneSheet,
        backdropDismiss: false,
        cssClass: "action-sheet-modal",
        componentProps: {
            title,
            subtitle,
            color,
            list,
            actionButtons
        }
        })
        modal.present()
        const { data } = await modal.onDidDismiss()
        return data
    }
