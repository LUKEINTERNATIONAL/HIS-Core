<template>
     <ion-list>
        <div v-if="singleView">
            <ion-item v-for="(item, index) in listData" :key="index">
                <ion-label> {{item.label}} </ion-label>
                <ion-label class="lb-value" slot="end"> {{item.value}} </ion-label>
            </ion-item>
        </div>
        <ion-row v-if="!singleView">
            <ion-col width-50>
                <ion-item v-for="(item, index) in leftLs" :key="index">
                    <ion-label> {{item.label}} </ion-label>
                    <ion-label class="lb-value" slot="end"> {{item.value}} </ion-label>
                    </ion-item>
                </ion-col>
            <ion-col width-50>
                <ion-item v-for="(item, index) in rightLs" :key="index">
                    <ion-label> {{item.label}} </ion-label>
                    <ion-label class="lb-value" slot="end"> {{item.value}} </ion-label>
                </ion-item>
            </ion-col>
        </ion-row>
    </ion-list>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Option } from "@/components/Forms/FieldInterface"
import {
    IonList,
    IonLabel,
    IonItem,
} from "@ionic/vue"

export default defineComponent({
    props: {
       listData: {
        type: Object as PropType<Option[]>,
        },
    },
     data: () => ({
        splitFactor: 11
    }),
    components: { 
        IonList,
        IonLabel,
        IonItem,
    },
    computed: {
        leftLs(): any {
        return this.listData?.filter( (element, index) => index < this.splitFactor)
        },
        rightLs(): any {
        return this.listData?.filter( (element, index) => index > this.splitFactor)
        },
        singleView(): boolean {

            let size: any = this.listData?.length
            size = this.listData?.length
            if (size > this.splitFactor) 
                return  false
                    
            return true
        }
    },
})
</script>
<style scoped>
    .view-port-content {
        height: 100%;
    }
    .lb-value {
        font-weight: bold;
    }
    .item .sc-ion-label-md-h {
        white-space: normal;
    }
</style>