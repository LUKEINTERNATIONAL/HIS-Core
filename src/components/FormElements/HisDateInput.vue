<template>
    <view-port :showFull="false">
        <ion-input class="input_display" :readonly="true" :value="fullDate"/>
    </view-port>
    <ion-grid class="his-floating-keyboard">
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
        <ion-row> 
            <ion-col class="ion-text-center" > 
                <ion-button style="width:100%; height:10vh;" color="light" @click="today"> 
                    <b>TODAY</b>
                </ion-button>
            </ion-col>
        </ion-row>
    </ion-grid>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ViewPort from "@/components/DataViews/ViewPort.vue"
import FieldMixinVue from './FieldMixin.vue'
import HisDate from "@/utils/Date"
import { Service } from '@/services/service'
import PickerSelector from "@/components/Selectors/PickerSelector.vue"
import { IonGrid, IonInput, IonCol, IonRow, IonButton } from '@ionic/vue'

export default defineComponent({
    components: { PickerSelector, IonInput, ViewPort, IonGrid, IonCol, IonRow, IonButton},
    mixins: [FieldMixinVue],
    data: ()=>({ 
        value: '',
        date: '' as any
    }),
    async activated(){
        this.$emit('onFieldActivated', this)
        this.today()
        await this.setDefaultValue()
    },
    methods: {
        async setDefaultValue() {
            if (this.defaultValue && !this.date) {
                const defaults = await this.defaultValue(this.fdata, this.cdata)
                if (defaults) this.date = defaults.toString()
            }
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
        fullDate(): any {
            return this.date ? HisDate.toStandardHisFormat(this.date) : '';
        }
    },
    watch: {
        date(value){
            this.$emit('onValue', { label: value, value: this.fullDate })
        },
        clear() {
            this.today()
        }
    }
})
</script>
