<template>
    <view-port :showFull="false">
        <base-input type="text" :value="value" @onValue="onKbValue"/>
    </view-port>
    <div class="his-floating-keyboard"> 
        <div class="his-floating-keyboard-content"> 
            <table style="width:99.9%;"> 
                <tr v-for="(tr, index) in layout" :key="index"> 
                    <td  v-for="(cl, cindex) in tr" :key="cindex"> 
                        <ion-button 
                            style="text-transform: none;"
                            fill="outline"
                            strong
                            @click="keypress(cl)" 
                            :class="`key__button ${cl.toLowerCase()}_btn`">
                            {{cl}} 
                        </ion-button>
                    </td>
                </tr>
            </table>
        </div>
        <ion-button fill="outline" @click="keypress('space')" strong style="width:100%;" shape="round" size="large" > Space </ion-button>
    </div>
  
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import handleVirtualInput from "@/components/Keyboard/KbHandler"
import { Option } from '../Forms/FieldInterface'
import ViewPort from "@/components/DataViews/ViewPort.vue"
import FieldMixinVue from './FieldMixin.vue'
import { isPlainObject } from 'lodash'
import { NOTE_PAD_KEYBOARD } from "@/components/Keyboard/KbLayouts"
import { IonButton } from "@ionic/vue"
import BaseInput from "@/components/FormElements/BaseTextInput.vue"

export default defineComponent({
    components: { 
        ViewPort,
        BaseInput,
        IonButton
    },
    mixins: [FieldMixinVue],
    data: () => ({
        value: '' as string,
        capsOn: false as boolean,
        layout: NOTE_PAD_KEYBOARD as Array<any>,
    }),
    async activated(){
        this.$emit('onFieldActivated', this)
        await this.setDefaultValue()
    },
    methods: {
        async setDefaultValue() {
            if (this.defaultValue && !this.value) {
                const defaults: any = await this.defaultValue(this.fdata, this.cdata)
                if (defaults) {
                    if (isPlainObject(defaults)) {
                        this.emitValue(defaults)
                        this.value = defaults.value.toString()
                    } else {
                        this.value = defaults
                        this.emitValue({label: defaults, value: defaults})
                    }
                }
            }
        },
        updateKeyboardCaps(isUpperCase=false) {
            this.layout = this.layout.map((r: string[]) => 
                r.map((i: string) => isUpperCase ? i.toUpperCase() : i.toLowerCase()
            ))
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
        async onKbValue(text: any) {
            await this.emitValue({ label: text, value: text })
        },
        async keypress(text: any){
            const input = handleVirtualInput(
                this.capsOn ? text.toUpperCase() : text.toLowerCase(), 
                this.value
            )
            if (input.match(/caps/i)) {
                this.capsOn = this.capsOn ? false : true
                this.updateKeyboardCaps(this.capsOn)
                return
            }
            await this.emitValue({ label: input, value: input })
        }
    },
    watch: {
        clear() { this.value = '' }
    }
})
</script>
<style scoped> 
#view-port {
    height: 53vh;
}
.delete_btn, .enter_btn, .clear_btn, .caps_btn {
    width: 10vw !important;
}
.key__button {
  box-sizing: border-box;
  font-size: 1.4em;
  width: 8vw;
  height: 9vh;
  border-color: #f2f2f2;
  border-style: solid;
  text-shadow: 0 0.5px 1px #777, 0 2px 6px #f2f2f2;
  border-width: 1px;
  border-radius: 10px!important;
}
</style>
