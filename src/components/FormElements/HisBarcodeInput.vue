<template>
    <view-port :showFull="false">
        <div class="view-port-content"> 
            <barcode-input @onScan="onScan"> </barcode-input>    
        </div>
    </view-port>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import FieldMixinVue from './FieldMixin.vue'
import BarcodeInput from "@/components/BarcodeInput.vue"
import ViewPort from '../DataViews/ViewPort.vue'

export default defineComponent({
    mixins: [FieldMixinVue],
    components: { BarcodeInput, ViewPort },
    methods: {
        onScan(text: string) {
            this.$emit('onValue', text)
        }
    }
})
</script>
