<template>
    <view-port :showFull="false">
        <ion-grid>
            <ion-row >
                <ion-col v-if="config && config.prepend" size-md="4">
                    <ion-input :value="config.prependValue" class="input_display" :disabled="true"/>
                </ion-col>
                <ion-col size-md="">
                    <base-input :type="inputType" :value="value" @onValue="onKbValue"/>
                </ion-col>
            </ion-row>
        </ion-grid>
        <ion-list v-if="listData.length > 0" class='view-port-content'>
            <ion-item button v-for="(item, index) in listData" :key="index" @click="onselect(item)"> 
                <ion-label> {{item.label}} </ion-label>
            </ion-item>
        </ion-list>
    </view-port>   
    <his-keyboard :initalKeyboardName="initalKeyboardName" :kbConfig="keyboard" :onKeyPress="keypress" :disabled="false"> </his-keyboard>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseInput from "@/components/FormElements/BaseTextInput.vue"
import HisKeyboard from "@/components/Keyboard/HisKeyboard.vue"
import handleVirtualInput from "@/components/Keyboard/KbHandler"
import { IonInput, IonList, IonItem, IonLabel} from "@ionic/vue"
import { Option } from '../Forms/FieldInterface'
import { QWERTY } from "@/components/Keyboard/HisKbConfigurations"
import ViewPort from "@/components/DataViews/ViewPort.vue"
import FieldMixinVue from './FieldMixin.vue'

export default defineComponent({
    components: { IonInput, BaseInput, HisKeyboard, ViewPort, IonList, IonItem, IonLabel },
    mixins: [FieldMixinVue],
    data: ()=>({
        value: '',
        initalKeyboardName: '' as string,
        keyboard: {} as Array<any>,
        listData: [] as Array<Option>
    }),
    computed: {
        inputType(): string {
            if (this.config && 'inputType' in this.config) {
                return this.config.inputType
            }
            return 'text'
        }
    },
    created() {
        this.keyboard = this.config?.customKeyboard || QWERTY
        if (this.config) {
            if (this.config.initialKb) {
                this.initalKeyboardName = this.config.initialKb
            }
        }
    },
    async activated(){
        this.$emit('onFieldActivated', this)
        await this.setDefaultValue()
    },
    methods: {
        async setDefaultValue() {
            if (this.defaultValue) {
                const defaults: Option = await this.defaultValue(this.fdata, this.cdata)
                if (defaults) {
                    this.value = defaults.value.toString()
                    this.emitValue(defaults)
                }
            }
        },
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
        value: {
            async handler() {
              if (this.options) {
                this.listData = await this.options(this.fdata)
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