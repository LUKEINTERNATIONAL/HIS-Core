<template>
    <view-port :showFull="false">
        <base-input :value="fullDate" @onValue="onKbValue"/>
    </view-port>
    <ion-grid class="his-floating-keyboard">
        <ion-row> 
            <ion-col> 
                <ion-button class="ion-float-right" color="warning" @click="today"> 
                    TODAY
                </ion-button>
            </ion-col>
        </ion-row>
        <ion-row> 
            <ion-col sm-size="12"> 
                <picker-selector
                    :value="getYear"
                    @onIncrement="add('year')"
                    @onDecrement="subtract('year')"
                />
            </ion-col>
            <ion-col sm-size="12"> 
                <picker-selector
                    :value="getMonth"
                    @onIncrement="add('month')"
                    @onDecrement="subtract('month')"
                />
            </ion-col>
            <ion-col sm-size="12"> 
                <picker-selector
                    :value="getDay"
                    @onIncrement="add('day')"
                    @onDecrement="subtract('day')"
                />
            </ion-col>
        </ion-row>
    </ion-grid>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseInput from "@/components/FormElements/BaseTextInput.vue"
import handleVirtualInput from "@/components/Keyboard/KbHandler"
import { NUMBERS_ONLY } from "@/components/Keyboard/HisKbConfigurations"
import ViewPort from "@/components/DataViews/ViewPort.vue"
import FieldMixinVue from './FieldMixin.vue'
import HisDate from "@/utils/Date"
import { Service } from '@/services/service'
import PickerSelector from "@/components/Selectors/PickerSelector.vue"
import { IonGrid, IonCol, IonRow, IonButton } from '@ionic/vue'

export default defineComponent({
    components: { PickerSelector, BaseInput, ViewPort, IonGrid, IonCol, IonRow, IonButton},
    mixins: [FieldMixinVue],
    data: ()=>({ 
        value: '',
        keyboard: NUMBERS_ONLY,
        date: '' as any
    }),
    async activated(){
        this.$emit('onFieldActivated', this)
        this.date = new Date();
        await this.setDefaultValue()
    },
    methods: {
        async setDefaultValue() {
            if (this.defaultValue && !this.value) {
                const defaults = await this.defaultValue(this.fdata, this.cdata)
                if (defaults) {
                    this.value = defaults.toString()
                }
            }
        },
        onKbValue(text: any) { 
            this.value = text
        },
        async keypress(text: any){
            this.value = handleVirtualInput(text, this.value)
        },
        add(unit: string) {
            this.date = HisDate.add(`${this.date}`, unit, 1)
        },
        subtract(unit: string) {
           this.date = HisDate.subtract(`${this.date}`, unit, 1)
        },
        today() {
            this.date = Service.getSessionDate();
        }
    },
    computed: {
        getYear(): any {
            return HisDate.getYear(`${this.date}`);
        },
        getMonth(): any {
            return HisDate.getMonth(`${this.date}`);
        },
        getDay(): any {
            return HisDate.getDay(`${this.date}`);
        },
        fullDate(): any{
            return HisDate.toStandardHisFormat(this.date);
        }
    },
    watch: {
        value(value){
            this.$emit('onValue', { label: value, value: this.fullDate })
        },
        clear() {
            this.value = ''
        }
    }
})
</script>
<style scoped> 
#view-port {
    height: 53vh;
}
.date-inputs {
    border: solid 1px black;
    font-size: 1.7em;
    text-align: center;
}
/* ion-button {
    font-size: 20px;
} */
</style>