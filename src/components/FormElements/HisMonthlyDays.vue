<template>
    <view-port>
        <base-input :value="value"/>
    </view-port>
    <his-keyboard :kbConfig="keyboard" :onKeyPress="keypress" :disabled="false"> </his-keyboard>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseInput from "@/components/FormElements/BaseTextInput.vue"
import HisKeyboard from "@/components/Keyboard/HisKeyboard.vue"
import handleVirtualInput from "@/components/Keyboard/KbHandler"
import { MONTHLY_DAYS } from "@/components/Keyboard/HisKbConfigurations"
import ViewPort from '@/components/DataViews/ViewPort.vue'
import { MONTHLY_DAYS_LO } from '../Keyboard/KbLayouts'
import FieldMixinVue from './FieldMixin.vue'

export default defineComponent({
    components: { BaseInput, HisKeyboard, ViewPort },
    mixins: [FieldMixinVue],
    data: ()=>({ 
        value: '',
        keyboard: MONTHLY_DAYS
    }),
    created() {
        if (this.config  && this.config.keyboardActions) {
            this.keyboard = [
                MONTHLY_DAYS_LO,
                this.config.keyboardActions
            ]
        }
    },
    activated(){
        this.$emit('onFieldActivated', this)
    },
    methods: {
        async keypress(text: any){
            this.value = handleVirtualInput(text, '')
            this.$emit('onValue', { label: this.value, value: this.value })
        }
    },
    watch: {
        clear(val: boolean){
            if (val) this.value = ''
        }
    }
})
</script>