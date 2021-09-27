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
        onScan(text: string) {
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