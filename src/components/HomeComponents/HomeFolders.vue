<template>
    <ion-button 
        v-if="showingChildNodes"
        @click="onBack"
        >
        Back 
    </ion-button>
    <ion-grid> 
        <ion-row>
            <ion-col 
                v-for="(item, index) in viewableItems" 
                :key="index"
                size="4"
                >
                <task-card
                    @click="onClick(item)"
                    :title="item.name"
                    :icon="itemIcon(item)"
                >
                </task-card>
            </ion-col>
        </ion-row>
    </ion-grid>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import TaskCard from "@/components/DataViews/TaskCard.vue";
import { FolderInterface } from "@/apps/interfaces/AppInterface"
import img from '@/utils/Img'
import {
    IonGrid,
    IonRow,
    IonCol
} from "@ionic/vue";

export default defineComponent({
    components: { 
        TaskCard,
        IonGrid,
        IonRow,
        IonCol
    },
    props: {
        items: {
            type: Object as PropType<FolderInterface[]>,
            required: true
        }
    },
    data: () => ({
        viewableItems: [] as any,
        showingChildNodes: false as boolean
    }),
    watch: {
        items: {
            handler(items: FolderInterface[]) {
                if (items) {
                    this.viewableItems = items
                }
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        onClick(item: any){
            if (item.files) {
                this.showingChildNodes = true
                return this.viewableItems = item.files
            } else if (item.pathName) {
                this.$router.push({ name: item.pathName })
            } else if (item.pathUrl) {
                this.$router.push(item.pathUrl)
            }
        },
        onBack() {
            this.showingChildNodes = false
            this.viewableItems = this.items
        },
        itemIcon(item: any) {
            return img(item.icon ? item.icon : 'sys-setting.png')
        }
    }
})
</script>
