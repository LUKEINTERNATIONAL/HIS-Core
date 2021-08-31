<template>
    <action-header :title="title" :subtitle="subtitle" :color="color"> </action-header>
    <ion-content>
        <ion-row class="vertically-align" > 
            <ion-col v-for="(label, index) in list" :key="index" size="12"> 
                <interval-card 
                    @onclick="onclick(label)" 
                    :color="activeLabel === label ? 'active-card-color' : ''"
                    :label="label"> 
                </interval-card>
            </ion-col>
        </ion-row>
    </ion-content>
    <action-footer :buttons="buttons"> </action-footer>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import IntervalCard from "@/components/DataViews/IntervalCard.vue"
import ActionSheetMixin from "@/components/DataViews/actionsheet/ActionSheetMixin.vue"
import { NavBtnInterface } from '@/components/HisDynamicNavFooterInterface'
import { modalController } from '@ionic/vue';
import { toastWarning } from "@/utils/Alerts"

export default defineComponent({
    components: { IntervalCard },
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
                        return toastWarning('Please select something chonde!')
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
    .his-card {
        margin: auto;
        width: 98%;
    }
    .active-card-color {
        color: white !important;
        border-color: white !important;
    }
</style>
