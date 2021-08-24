<template>
    <view-port :showFull="false">
        <ion-grid>
            <ion-row >
                <ion-col v-if="config && config.prepend" size-md="2">
                    <p>{{config.prependValue}}</p>
                </ion-col>
                <ion-col size-md="">
                    <base-input :value="value" @onValue="onKbValue"/>
                </ion-col>
            </ion-row>
        </ion-grid>
        <ion-list v-if="listData.length > 0" class='view-port-content'>
            <ion-item button v-for="(item, index) in listData" :key="index" @click="onselect(item)"> 
                <ion-label> {{item.label}} </ion-label>
            </ion-item>
        </ion-list>
    </view-port>   
    <his-keyboard :kbConfig="keyboard" :onKeyPress="keypress" :disabled="false"> </his-keyboard>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import BaseInput from "@/components/FormElements/BaseTextInput.vue"
import HisKeyboard from "@/components/Keyboard/HisKeyboard.vue"
import handleVirtualInput from "@/components/Keyboard/KbHandler"
import { IonList, IonItem, IonLabel} from "@ionic/vue"
import { Option } from '../Forms/FieldInterface'
import { QWERTY } from "@/components/Keyboard/HisKbConfigurations"
import { TextInputInterface } from '@/components/FormElements/Interfaces/TextConfig'
import ViewPort from "@/components/DataViews/ViewPort.vue"
export default defineComponent({
    components: { BaseInput, HisKeyboard, ViewPort, IonList, IonItem, IonLabel },
    data: ()=>({
        value: '',
        keyboard: {} as Array<any>,
        listData: [] as Array<Option>
    }),
    props: {
        fdata: {
            type: Object,
            required: true
        },
        preset: {
            type: Object as PropType<Option>,
            required: false
        },
        options: {
            type: Function,
            required: false,
        },
        onValue: {
            type: Function
        },
        config: {
            type: Object as PropType<TextInputInterface>,
        },
        clear: {
            type: Boolean
        },
    },
    mounted() {
        if (this.preset) this.onselect(this.preset)

        this.keyboard = this.config?.customKeyboard || QWERTY
    },
    activated(){
        this.$emit('onFieldActivated', this)
    },
    methods: {
        async emitValue(v: Option) {
            if (this.onValue) {
                const ok = await this.onValue(v)
                if (!ok) {
                    return
                }
            }
            this.value = v.label
            this.$emit('onValue', v)
        },
        async onselect(item: Option){
            await this.emitValue(item)
        },
        async onKbValue(text: any) {
            await this.emitValue({ label: text, value: text })
        },
        async keypress(text: any){
            const input = handleVirtualInput(text, this.value)
            await this.emitValue({ label: input, value: input })
        }
    },
    watch: {
        fdata: {
            async handler(data: any) {
              if (this.options) {
                this.listData = await this.options(data)
              }
            },
            deep: true
        },
        clear(val: boolean){
            if (val) this.value = ''
        }
    }
})
</script>
<style scoped> 
#view-port {
    height: 53vh;
}
</style>