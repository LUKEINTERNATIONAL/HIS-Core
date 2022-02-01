<template>
    <view-port :showFull="!showKeyboard">
        <his-text-input :readonly="!showKeyboard" :value="selected" @onValue="(value) => onKbValue(value, showKeyboard)" /> 
        <ion-list class='view-port-content'>
            <ion-item 
                button v-for="(item, index) in filtered" 
                :color="item.label === selected ? 'light': ''" 
                :key="index"
                :disabled="'disabled' in item && item.disabled ? true: false"
                @click="onselect(item)"> 
                <ion-label> {{item.label}} </ion-label>
            </ion-item>
        </ion-list>
    </view-port>
    <his-keyboard v-if="showKeyboard" :kbConfig="keyboard" :onKeyPress="keypress"/>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { Option } from '../Forms/FieldInterface'
import SelectMixin from "@/components/FormElements/SelectMixin.vue"
import { find } from "lodash"

export default defineComponent({
    name: "HisSelect",
    mixins: [SelectMixin],
    watch: {
        clear() { 
            this.clearSelection() 
        }
    },
    async activated() {
        this.$emit('onFieldActivated', this)
        this.listData = await this.options(this.fdata)
        await this.setDefaultValue()
    },
    methods: {
        async setDefaultValue() {
            if(this.defaultValue) {
                const defaults: string = await this.defaultValue(this.fdata, this.cdata, this.selected)
                if (defaults) {
                    const found = find(this.listData, {label: defaults}) || find(this.listData, {value: defaults}) 
                    if (found) {
                        this.onselect(found)
                    } else {
                        this.filter = defaults
                    }
                }
            }
        },
        async onselect(item: Option) {
            this.selected = item.label
            if (this.onValue) {
                const ok = await this.onValue(item, this)
                if (!ok) {
                    this.selected = ''
                    return
                }
            }
            this.$emit('onValue', item)
        }
    }
})
</script>
<style scoped>
    .view-port-content {
        height: 91%;
        padding-bottom: 0px;
    }
    ion-item {
        --min-height: 40px;
        font-size: 1.1em;
    }
    #view-port {
        height: 81vh;
    }
</style>