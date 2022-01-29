<template>
    <view-port>
        <div class="view-port-content"> 
            <ion-list>
                <ion-row>
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
        </div>
  </view-port>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { Option } from "@/components/Forms/FieldInterface"
import ViewPort from "@/components/DataViews/ViewPort.vue"
import FieldMixinVue from './FieldMixin.vue'
import {
    IonList,
    IonLabel,
    IonItem,
} from "@ionic/vue"

export default defineComponent({
    components: { 
        ViewPort,
        IonList,
        IonLabel,
        IonItem,
    },
    mixins: [FieldMixinVue],
    data: () => ({
        listData: [] as Array<Option[]>
    }),
    async activated() {
        this.$emit('onFieldActivated', this)
        this.listData = this.options(this.fdata, this.cdata)
    },
    computed: {
        leftLs(): any {
        return this.listData.filter( (element, index) => index < 11)
        },
        rightLs(): any {
        return this.listData.filter( (element, index) => index > 11)
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
