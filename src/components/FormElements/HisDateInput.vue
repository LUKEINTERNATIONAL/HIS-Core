<template>
    <view-port>
        <base-input :value="fullDate" @onValue="onKbValue"/>
    </view-port>
    <ion-grid>
        <ion-row>
            <ion-col size="2">
                <ion-button @click="add('day')" size="large">+</ion-button>
            </ion-col>
            <ion-col size="2">
                <ion-button @click="add('month')" size="large">+</ion-button>
            </ion-col>
            <ion-col size="2">
                <ion-button @click="add('year')" size="large">+</ion-button>
            </ion-col>
        </ion-row>
        <ion-row>
            <ion-col size="2">
                <ion-input class="date-inputs">{{ getDay }}</ion-input>
            </ion-col>
            <ion-col size="2">
                <ion-input class="date-inputs">{{ getMonth }}</ion-input>
            </ion-col>
            <ion-col size="2">
                <ion-input class="date-inputs">{{getYear}}</ion-input>
            </ion-col>
            <ion-col size="2">
                <ion-button @click="today()" size="large">
                    Today
                </ion-button>
            </ion-col>
        </ion-row>
        <ion-row>
            <ion-col size="2">
                <ion-button @click="subtract('day')" size="large">-</ion-button>
            </ion-col>
            <ion-col size="2">
                <ion-button @click="subtract('month')" size="large">-</ion-button>
            </ion-col>
            <ion-col size="2">
                <ion-button @click="subtract('year')" size="large">-</ion-button>
            </ion-col>
        </ion-row>
    </ion-grid>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseInput from "@/components/FormElements/BaseTextInput.vue"
import HisKeyboard from "@/components/Keyboard/HisKeyboard.vue"
import handleVirtualInput from "@/components/Keyboard/KbHandler"
import { NUMBERS_ONLY } from "@/components/Keyboard/HisKbConfigurations"
import ViewPort from "@/components/DataViews/ViewPort.vue"
import FieldMixinVue from './FieldMixin.vue'
import HisDate from "@/utils/Date"
import { Service } from '@/services/service'
import {IonInput, IonGrid, IonCol, IonRow, IonButton} from '@ionic/vue'

export default defineComponent({
    components: { BaseInput, ViewPort, IonInput, IonGrid, IonCol, IonRow, IonButton},
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
        clear(val: boolean){
            if (val) {
                this.value = ''
                this.$emit('onClear')
            }
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
}
ion-col {
    text-align: center;
}
/* ion-button {
    font-size: 20px;
} */
</style>