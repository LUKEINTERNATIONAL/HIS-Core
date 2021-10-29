<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>
                    {{ title }}
                </ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content> 
            <ion-list> 
                <ion-item v-for="(item, index) in items" :key="index">
                    <ion-checkbox 
                        slot="start" 
                        :checked="item.isChecked"
                        @ionChange="(e) => check(e, item)"
                        >
                    </ion-checkbox>
                    <ion-label> {{item.name}} </ion-label>
                    <ion-button
                       @click="onAction(() => reassignIdentifier(item), 'reassign')"> 
                        Re-Assign 
                    </ion-button>
                </ion-item>
            </ion-list>
        </ion-content>
        <ion-footer> 
            <ion-toolbar color="dark"> 
                <ion-button 
                    color="danger" 
                    slot="start" 
                    size="large">
                    Cancel
                </ion-button>
                <ion-button 
                    v-if="itemsChecked.length > 0"
                    @click="clear" 
                    color="warning" 
                    slot="end" 
                    size="large">
                    Clear
                </ion-button>
                <ion-button 
                    v-if="itemsChecked.length > 1"
                    @click="onAction(mergeSelected, 'merge')"
                    color="primary"
                    size="large"
                    slot="end"
                    >
                    Merge ({{itemsChecked.length}})
                </ion-button>
                <ion-button 
                    v-if="items.length <= 1"
                    color="success"
                    size="large"
                    slot="end"
                    >
                    Next
                </ion-button>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import {
    IonPage,
    IonButton,
    IonList,
    IonItem,
    IonToolbar,
    IonHeader,
    IonTitle,
    IonContent,
    IonFooter,
} from "@ionic/vue"
import { PatientDemographicsExchangeService } from "@/services/patient_demographics_exchange_service"
import { Patientservice } from '@/services/patient_service'
import { alertConfirmation, toastWarning } from '@/utils/Alerts'
import { nextTask } from "@/utils/WorkflowTaskHelper"

export default defineComponent({
    components: {
        IonPage,
        IonButton,
        IonList,
        IonItem,
        IonToolbar, 
        IonHeader,
        IonTitle,
        IonContent,
        IonFooter
    },
    data: () => ({
        dde: {} as any,
        items: [] as any,
        title: '' as string
    }),
    watch: {
        $route: {
            async handler({params}: any) {
                if (params){
                    this.title = `Duplicates for NPID (${params.npid})`
                    await this.init(params.npid)
                }
            },
            deep: true,
            immediate: true
        }
    },
    computed: {
        itemsChecked(): any {
            return this.items.filter((i: any) => i.isChecked)
        }
    },
    methods: {
        check(e: any, i: any) {
            i.isChecked = e.detail.checked
        },
        async onAction(action: Function, context='proceed') {
            const ok = await alertConfirmation(`
                Are you sure you want to ${context}?
            `)
            if (ok) {
                try { await action() } catch(e) { toastWarning(e) }
            }
        },
        async mergeSelected() {
            const req = await this.dde.postMerge(this.itemsChecked)
            if (req) {
                await this.dde.printNpid(this.dde.patientID)
                nextTask(this.dde.patientID, this.$router)
            }
        },
        async reassignIdentifier(item: any) {
            const reassign = await this.dde.reassignNpid(item.docID, item.patientID)

            if (!reassign)  return  

            if (reassign.errorCode === 422) {
                const ok = await alertConfirmation(
                    'Do you want to update missing information?', 
                    'Incomplete Demographics'
                )
                if (ok) {
                    this.$router.push(`/patient/registration?edit_person=${item.patientID}`)
                }
            } else {
                await this.dde.printNpid(item.patientID)
                await nextTask(item.patientID, this.$router)
            }
        },
        buildItems(items: any) {
            return items.map((i: any) => {
                const p = new Patientservice(i)
                return {
                    isChecked: false,
                    patientID: p.getID(),
                    name: p.getFullName(),
                    docID: p.getPatientIdentifier(27)
                }
            })
        },
        clear() {
            this.items = this.items.map((i: any) => {
                i.isChecked = false
                return i
            })
        },
        async init(npid: string) {
            this.dde = new PatientDemographicsExchangeService()
            const {locals, remotes} = await this.dde.findNpid(npid)
            this.items = [
                ...this.buildItems(locals), 
                ...this.buildItems(remotes)
            ]
        }
    }
})
</script>
