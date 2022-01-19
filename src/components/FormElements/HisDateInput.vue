<template>
    <view-port :showFull="false">
        <ion-input class="input_display" :readonly="true" :value="value"/>
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
                <ion-button style="width:30%; height:6vh;" @click="today"> 
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
        date: '' as any,
        isInit: true as boolean
    }),
    async activated(){
        this.$emit('onFieldActivated', this)
        this.date = new Date()
        await this.setDefaultValue()
        this.isInit = false
    },
    methods: {
        async setDefaultValue() {
            if (this.defaultValue && !this.value) {
                const defaults = await this.defaultValue(this.fdata, this.cdata)
                if (defaults) {
                    this.isInit = false
                    this.date = new Date(defaults)
                } 
            }
        },
        add(unit: string) {
            this.date = HisDate.add(`${this.date}`, unit, 1)
        },
        subtract(unit: string) {
           this.date = HisDate.subtract(`${this.date}`, unit, 1)
        },
        today() {
            this.date = new Date(Service.getSessionDate())
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
        }
    },
    watch: {
        date(newDate: string) {
            if (!this.isInit) { // avoid setting initial date unless otherwise
                this.value = HisDate.toStandardHisFormat(newDate)
            }
        },
        value(value) {
            if (!value) {
                this.$emit('onValue', null)
                return
            }
            this.$emit('onValue', { label: value, value: this.value })
        },
        clear() {
            this.value = ''
        }
    }
})
</script>
