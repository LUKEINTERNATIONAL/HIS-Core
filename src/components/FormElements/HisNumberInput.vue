<template>
    <view-port>
        <base-input :value="value" @onValue="onKbValue"/>
    </view-port>
    <his-keyboard :kbConfig="keyboard" :onKeyPress="keypress" :disabled="false"> </his-keyboard>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseInput from "@/components/FormElements/BaseTextInput.vue"
import HisKeyboard from "@/components/Keyboard/HisKeyboard.vue"
import handleVirtualInput from "@/components/Keyboard/KbHandler"
import { NUMBERS_ONLY, NUMBERS_WITH_ESTIMATE } from "@/components/Keyboard/HisKbConfigurations"
import ViewPort from "@/components/DataViews/ViewPort.vue"
import FieldMixinVue from './FieldMixin.vue'

export default defineComponent({
    components: { BaseInput, HisKeyboard, ViewPort },
    mixins: [FieldMixinVue],
    data: ()=> ({
        value: '',
        keyboard: NUMBERS_ONLY,
    }),
    activated() {
        this.$emit('onFieldActivated', this)
        if (typeof this.config.noChars === 'boolean') {
            this.keyboard = this.config.noChars ? NUMBERS_ONLY : NUMBERS_WITH_ESTIMATE
        }
    },
    async mounted() {
        this.setDefaultValue()
        if(this.config.keypad) this.keyboard = this.config.keypad
        await this.setDefaultValue()
    },
    methods: {
        async setDefaultValue() {
            if (typeof this.defaultValue === 'function') {
                const defaults = await this.defaultValue(this.fdata, this.cdata)
                if (defaults) this.value = `${defaults}`
            }
        },
        onKbValue(text: any) { 
            this.value = text
        },
        keypress(text: any){
            this.value = handleVirtualInput(text, this.value)
        }
    },
    watch: {
        value(value: string){
            this.$emit('onValue', !value ? null : { label: value, value })
        },
        clear() { this.value = '' }
    }
})
</script>