<template>
    <view-port :showFull="false">
        <ion-grid>
            <ion-row>
                <ion-col 
                    v-for="(address, index) in addressInputs"
                    :key="index"
                    > 
                    <ion-input
                        mode='md'
                        inputmode="numeric"
                        type="number"
                        :max="255"
                        :class="{
                            'highlighted-input' : index === activeIndex
                        }"
                        v-model="addressInputs[index]"
                        @ionFocus="onAddressClick(index)"
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
        :onKeyPress="keypress" 
        :kbConfig="numbers" 
        > 
    </his-keyboard>
</template>

<script lang="ts">
import { defineComponent, onActivated, ref, watch } from 'vue'
import HisKeyboard from "@/components/Keyboard/HisKeyboard.vue"
import { NUMBER_PAD_LO } from "@/components/Keyboard/KbLayouts"
import ViewPort from "@/components/DataViews/ViewPort.vue"
import FieldMixinVue from './FieldMixin.vue'
import handleVirtualInput from "@/components/Keyboard/KbHandler"
import { 
    IonInput,
    IonRow,
    IonCol,
    IonGrid
} from "@ionic/vue"
import { isEmpty } from 'lodash'

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
    watch: {
        clear(ok: any) {
            if (ok) {
                this.addressInputs = {
                    first:  '',
                    second: '',
                    third:  '',
                    fourth: ''
                }
                this.$emit('onClear')
            }
        }
    },
    setup(props, {emit}) {
        onActivated(() => emit('onFieldActivated', this))
        const showKeyboard = ref(false)
        const activeIndex = ref('')
        // Track IP Address parts
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
            const value = handleVirtualInput(
                input, addressInputs.value[index]
            )
            // Tab to next IP Address part if value exceeds 3
            if (value.length > 3) {
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
            } else {
                // Do a check here to prevent the first letter being 
                // a zero for that IP Address
                addressInputs.value[index] = 
                    value.charAt(0) === '0' && value.length > 1
                    ? value.substring(1)
                    : value
            }
        }

        function onAddressClick(index: string) {
            activeIndex.value = index
            showKeyboard.value = true
        }

        watch(addressInputs, (address) => {
            if (!address) return
            // Only Emit the IP Address if all the parts are set
            const complete = Object.values(address)
                .map(
                    (i: any) => !isEmpty(i)
                )
            if (complete.every(Boolean)) {
                const value = Object
                    .values(address)
                    .map(i => i)
                    .join('.')
                emit('onValue', {label: value, value})
            } else {
                emit('onValue', null)
            }
        }, { deep: true, immediate: true })

        return {
            keypress,
            activeIndex,
            onAddressClick,
            showKeyboard,
            addressInputs,
            numbers: [
                NUMBER_PAD_LO,
                [
                   ['Delete'],
                   [ 'Clear' ]
                ]
            ]
        }
    }
})
</script>

<style scoped> 
#view-port {
    height: 53vh;
}
.highlighted-input {
    color: #3880ff;
    border-bottom: 3px solid #3880ff;
}
</style>