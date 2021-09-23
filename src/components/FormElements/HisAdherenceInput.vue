<template>
    <view-port>
        <div class='view-port-content'>
            <ion-grid> 
                <ion-row> 
                    <ion-col size="8"><b> Medication </b> </ion-col>
                    <ion-col size="4"><b> Amount Remaining </b> </ion-col>
                </ion-row>
                <ion-row v-for="(data, index) in listData" :key="index"> 
                    <ion-col size="8">  
                       <div class="his-card" :style="{textAlign:'left'}"> {{ data.label }} </div>
                    </ion-col>
                    <ion-col size="4"> 
                        <ion-input :value="data.value" @click="launchKeyPad(data)" class="his-card"/>
                    </ion-col>
                </ion-row>
            </ion-grid>   
        </div>
    </view-port>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import ViewPort from '../DataViews/ViewPort.vue'
import { modalController } from '@ionic/vue'
import { Option } from '@/components/Forms/FieldInterface'
import KeyPad from '../Keyboard/HisKeypad.vue'
import FieldMixinVue from './FieldMixin.vue'
export default defineComponent({
  components: { ViewPort },
  mixins: [FieldMixinVue],
  data: () => ({
    listData: [] as any
  }),
  watch: {
    clear: {
        handler(clear: boolean) {
            if(clear) this.onClear(); this.$emit('onClear');
        },
        immediate: true
    },
    listData: {
        handler() {
            this.$emit('onValue', this.listData)
        },
        deep: true,
        immediate: true
    }
  },
  async activated() {
    this.$emit('onFieldActivated', this)
    this.listData = await this.options(this.fdata)
  },
  methods: {
    onClear() {
        this.listData = this.listData.filter((item: Option) => {
            item.value = ''
            return true
        })
    },
    async launchKeyPad(item: Option) {
        const modal = await modalController.create({
            component: KeyPad,
            backdropDismiss: false,
            cssClass: 'keypad-modal',
            componentProps: {
                title: item.label,
                preset: item.value,
                onKeyPress(val: string){
                    item.value = val
                }
            }
        })
        modal.present()
    }
  }
})
</script>
<style scoped>
    .his-card {
        text-align: center;
        font-weight: bold;
        border: solid 1px #ccc;
        height: 75px;
        width: 100%;
    }
    .view-port-content {
        height: 100%;
    }
</style>
