<template>
    <ion-button 
        color="light"
        v-if="showingChildNodes"
        @click="onBack"
        >
        <ion-icon :icon="arrowBack"> </ion-icon>
        Back 
    </ion-button>
    <ion-grid> 
        <ion-row>
            <ion-col 
                v-for="(item, index) in viewableItems" 
                :key="index"
                size="4"
                v-show="canShowItem(item)"
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
    IonButton,
    IonGrid,
    IonIcon,
    IonRow,
    IonCol
} from "@ionic/vue";
import { arrowBack } from 'ionicons/icons';
export default defineComponent({
    setup() {
        return {
            arrowBack
        }
    },
    components: { 
        IonIcon,
        TaskCard,
        IonButton,
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
        defaultIcon: 'sys-setting.png' as string,
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
        canShowItem(item: FolderInterface) {
            return item.condition ? item.condition() : true
        },
        onClick(item: any){
            if (item.files) {
                this.showingChildNodes = true
                this.defaultIcon = 'sys-setting.png'
                if (item.defaultFilesIcon) {
                    this.defaultIcon = item.defaultFilesIcon
                }
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
            return img(item.icon ? item.icon : this.defaultIcon)
        }
    }
})
</script>
