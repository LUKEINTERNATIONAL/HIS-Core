<template>
    <action-header :title="title" :subtitle="subtitle" :color="color"></action-header>
    <ion-content class="ion-text-center">
        <ion-list>
            <ion-radio-group :value="activeLabel">
                <ion-item v-for="(label, index) in list" @click="onclick(label)" :key="index" >
                    <ion-radio slot="start" :value="label"></ion-radio>
                    <ion-label>{{ label }} </ion-label>
                </ion-item>
            </ion-radio-group>
        </ion-list>
    </ion-content>
    <action-footer :buttons="buttons"> </action-footer>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import ActionSheetMixin from "@/components/DataViews/actionsheet/ActionSheetMixin.vue"
import { NavBtnInterface } from '@/components/HisDynamicNavFooterInterface'
import { modalController } from '@ionic/vue';
import { toastWarning } from "@/utils/Alerts"
import { 
    IonList, 
    IonItem,
    IonContent,
    IonRadio,
    IonRadioGroup
} from "@ionic/vue"

export default defineComponent({
    components: { IonList, IonItem, IonContent,
    IonRadio,
    IonRadioGroup },
    mixins: [ActionSheetMixin],
    data: () => ({
        activeLabel: '' as string
    }),
    props: {
        list: {
            type: Object as PropType<string[]>,
            required: true
        }
    },
    methods: {
        onclick(label: string){
            this.activeLabel = label
        }
    },
    computed: {
        buttons(): Array<NavBtnInterface> {
            return this.actionButtons.map((b: NavBtnInterface) => ({
                ...b,
                onClick: async () => {
                    if (b.role && b.role.match(/action/i) && !this.activeLabel) {
                        return toastWarning('Please select one of the options')
                    }
                    await modalController.dismiss({ 
                        selection: this.activeLabel, action: b.name 
                    })
                }
            }))
        }
    }
})
</script>
<style scoped>
ion-item {
    font-size: 20px;
}
action-header {
    padding-bottom: 2rem;
}
</style>
