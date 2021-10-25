<template>
    <view-port>
        <base-input :value="value" @onValue="onKbValue"/>
    </view-port>
    <ion-grid>
        <ion-row>
            <ion-col>
                <ion-button>+</ion-button>
            </ion-col>
            <ion-col>
                <ion-button>+</ion-button>
            </ion-col>
            <ion-col>
                <ion-button>+</ion-button>
            </ion-col>
        </ion-row>
        <ion-row>
            <ion-col>
                {{getYear()}}
            </ion-col>
            <ion-col>
                <ion-input>{{ getMonth() }}></ion-input>
            </ion-col>
            <ion-col>
                <ion-input>{{getDay()}}</ion-input>
            </ion-col>
            <ion-col>
                <ion-button>
                    Today
                </ion-button>
            </ion-col>
        </ion-row>
        <ion-row>
            <ion-col>
                <ion-button>-</ion-button>
            </ion-col>
            <ion-col>
                <ion-button>-</ion-button>
            </ion-col>
            <ion-col>
                <ion-button>-</ion-button>
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

export default defineComponent({
    components: { BaseInput, ViewPort },
    mixins: [FieldMixinVue],
    data: ()=>({ 
        value: '',
        keyboard: NUMBERS_ONLY,
        date: new Date()
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
        value(value: number){
            this.$emit('onValue', { label: value, value })
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