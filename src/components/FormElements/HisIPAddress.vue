<template>
    <view-port :showFull="false">
        <ion-grid>
            <ion-row>
                <ion-col 
                    v-for="(address, index) in addressInputs"
                    :key="index"
                    > 
                    <ion-input
                        type="number"
                        v-model="addressInputs[index]"
                        @click="onAddressClick(index)"
                        :style="{ textAlign: 'center' }"
                        placeholder="0"
                        class="input_display"
                    />
                </ion-col>
            </ion-row>
        </ion-grid>
    </view-port>   
    <his-keyboard 
        v-if="showKeyboard"
        :kbConfig="NUMBERS_ONLY" 
        :onKeyPress="keypress" 
        > 
    </his-keyboard>
</template>
<script lang="ts">
import { defineComponent, onActivated, ref, watch } from 'vue'
import HisKeyboard from "@/components/Keyboard/HisKeyboard.vue"
import { NUMBERS_ONLY } from "@/components/Keyboard/HisKbConfigurations"
import ViewPort from "@/components/DataViews/ViewPort.vue"
import FieldMixinVue from './FieldMixin.vue'
import handleVirtualInput from "@/components/Keyboard/KbHandler"
import { 
    IonInput,
    IonRow,
    IonCol,
    IonGrid
} from "@ionic/vue"

export default defineComponent({
    components: { 
        IonInput, 
        IonRow,
        IonCol,
        IonGrid,
        HisKeyboard, 
        ViewPort
    },
    mixins: [FieldMixinVue],
    setup(props, {emit}) {
        onActivated(() => emit('onFieldActivated', this))
        const showKeyboard = ref(false)
        const activeIndex = ref('')
        const addressInputs = ref({
            first:  '',
            second: '',
            third:  '',
            fourth: ''
        }) as any

        function keypress(input: string) {
            if (!activeIndex.value) {
                return
            } 
            const index = activeIndex.value
            addressInputs.value[index] = handleVirtualInput(
                input, addressInputs.value[index]
            )
            if (addressInputs.value[index].length >= 3) {
                switch(activeIndex.value) {
                    case 'first':
                        activeIndex.value = 'second'
                        break
                    case 'second':
                        activeIndex.value = 'third'
                        break
                    case 'third':
                        activeIndex.value = 'fourth'
                        break
                    case 'fourth':
                        activeIndex.value = ''
                }
            }
        }

        function onAddressClick(index: string) {
            activeIndex.value = index
            showKeyboard.value = true
        }

        watch(addressInputs, () => {
            const complete = Object.values(addressInputs.value)
                .map((i: any) => {
                    const num = parseInt(i)
                    return !isNaN(num)
                        && num >= 0 
                        && num <= 255
                })
            if (complete.every(Boolean)) {
                const value = Object.values(addressInputs.value)
                    .map(i => i)
                    .join('.')
                emit('onValue', {label: value, value})
            }
        }, {deep: true, immediate: true})
        return {
            keypress,
            onAddressClick,
            showKeyboard,
            addressInputs,
            NUMBERS_ONLY
        }
    }
})
</script>

<style scoped> 
#view-port {
    height: 53vh;
}
</style>