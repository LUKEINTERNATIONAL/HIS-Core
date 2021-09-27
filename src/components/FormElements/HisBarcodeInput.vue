<template>
    <div class="his-card"> 
        <barcode-input @onScan="onScan"> </barcode-input>    
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import FieldMixinVue from './FieldMixin.vue'
import BarcodeInput from "@/components/BarcodeInput.vue"

export default defineComponent({
    mixins: [FieldMixinVue],
    components: { BarcodeInput },
    methods: {
        async onScan(text: string) {
            if (this.onValue) {
                const ok = await this.onValue(text)
                if (!ok) {
                    return
                }
            }
            this.$emit('onValue', text)
        }
    }
})
</script>
<style scoped>
    .his-card {
        margin: 2%;
    }
</style>