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
        keyboard: [] as any
    }),
    async activated() {
        this.$emit('onFieldActivated', this)
        let keypad: Array<any> = MONTHLY_DAYS_LO

        if (this.config) {
            // Generate dynamic keypad based on year and month configuration
            if (this.config.year && this.config.month) {
                keypad = this.generateKeypad(
                    this.config.year(this.fdata), 
                    this.config.month(this.fdata)
                )
            }
            // Load secondary keyboard buttons if configured
            if (this.config.keyboardActions) {
                this.keyboard = [
                    keypad, 
                    this.config.keyboardActions
                ]
            } else {
                this.keyboard = [
                    keypad, 
                    [
                        ['Unknown']
                    ]
                ]                
            }
        } else {
            // Use fixed configuration for everything
            this.keyboard = MONTHLY_DAYS
        }

        await this.setDefaultValue()
    },
    methods: {
        generateKeypad(year: number, month: number) {
            const days: Array<number[]> = [[]]
            const numberOfDays = new Date(year, month, 0).getDate()
            let row = 0
            let counter = 0
            for(let i=0; i < numberOfDays; ++i) {
                if (counter > 7) {
                    ++row
                    days[row] = []
                    counter = 0
                }
                days[row].push(i + 1)
                ++counter
            }
            return days
        },
        async setDefaultValue() {
            if (this.defaultValue && !this.value) {
                const defaults = await this.defaultValue(this.fdata, this.cdata)
                if (defaults){
                    this.value = defaults
                    this.$emit('onValue', { label: this.value, value: this.value })
                }
            }
        },
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
