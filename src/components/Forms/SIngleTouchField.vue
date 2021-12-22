<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title class="ion-text-center"> 
                    {{ currentField.helpText }}
                </ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <keep-alive> 
                <component
                    :key="currentField.id"
                    :is="currentField.type"
                    :currentFieldig="currentField.currentFieldig"
                    :options="currentField.options"
                    :preset="currentField.preset"
                    :clear="valueClearIndex"
                    :fdata="formData"
                    :cdata="computedFormData"
                    :activationState="state"
                    :onValue="currentField.onValue"
                    :defaultValue="currentField.defaultValue"
                    :onValueUpdate="currentField.onValueUpdate"
                    @onValue="onFieldValue"
                >
                </component>
            </keep-alive>
        </ion-content>
        <ion-footer> 
            <ion-toolbar color="light">
                <ion-button :disabled="disableBtn" @click="onClose" slot="start" color="danger" size="large"> 
                    Close
                </ion-button>
                <ion-button :disabled="disableBtn" @click="onClear" slot="end" color="warning" size="large"> 
                    Clear
                </ion-button>
                <ion-button :disabled="disableBtn" @click="onDone" slot="end" color="success" size="large"> 
                    Done
                </ion-button>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Field, Option } from "@/components/Forms/FieldInterface"
import { toastDanger, toastWarning } from "@/utils/Alerts";
import {
    IonToolbar,
    IonContent,
    IonHeader,
    IonTitle,
    IonButton,
    IonPage,
    IonFooter,
    modalController
} from "@ionic/vue"
import BarcodeInput from "@/components/FormElements/HisBarcodeInput.vue"
import SingleSelect from "@/components/FormElements/HisSelect.vue";
import SingleSelectCards from "@/components/FormElements/HisCardSelector.vue";
import MultipleSelect from "@/components/FormElements/HisMultipleSelect.vue";
import TextInput from "@/components/FormElements/HisTextInput.vue"
import NumberInput from "@/components/FormElements/HisNumberInput.vue"
import MonthlyDays from "@/components/FormElements/HisMonthlyDays.vue"
import YesNo from "@/components/FormElements/YesNoSelect.vue"
import MultiYesNo from "@/components/FormElements/MultiYesNoSelect.vue"
import IPAddressInput from "@/components/FormElements/HisIPAddress.vue"
import DateInput from "@/components/FormElements/HisDateInput.vue"
export default defineComponent({
    name: 'SingleFieldTouchForm',
    components: {
        IonPage,
        IonContent,
        IonFooter,
        IonToolbar,
        IonButton,
        IonHeader,
        IonTitle,
        TextInput,
        SingleSelect,
        MultipleSelect,
        NumberInput,
        MonthlyDays,
        BarcodeInput,
        YesNo,
        MultiYesNo,
        SingleSelectCards,
        DateInput,
        IPAddressInput
    },
    props: {
        dismissType: {
            type: String
        },
        onFinish: {
           type: Function,
           required: true
        },
        currentField: {
            type: Object as PropType<Field>,
            required: true
        }
    },
    data: () => ({
        valueClearIndex: 0 as number,
        formData: {} as any,
        computedFormData: {} as any,
        state: "" as string,
        value: null as Option | Option[] | null,
        disableBtn: false as boolean,
    }),
    methods: {
        onClose() {
            if (this.dismissType === 'modal') {
                modalController.dismiss()
            } else {
                this.$router.back()
            }
        },
        onClear() {
            this.valueClearIndex += 1
            this.value = null
        },
        onFieldValue(value: any) {
            this.value = value
        },
        onDone() {
            this.disableBtn = true
            if (this.currentField.validation) {
                const errors = this.currentField.validation(this.value)
                this.disableBtn = false
                if (errors) return toastWarning(errors.join(", "), 60000);
            } 
            try {
                this.onFinish(this.value)
            } catch(e) {
                toastDanger(e)
            }
            this.onClose()
            this.disableBtn = false
        }
    }
})
</script>
