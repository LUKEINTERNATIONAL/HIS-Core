<template>
    <ion-header>
        <ion-toolbar>
            <ion-title class="ion-text-center"> 
                {{ helpText }}
            </ion-title>
        </ion-toolbar>
    </ion-header>
    <ion-content> 
        <keep-alive>
            <component
            :key="currentField.id"
            v-bind:is="currentField.type"
            :config="currentField.config"
            :options="currentField.options"
            :clear="valueClearIndex"
            :fdata="formData"
            :cdata="computedFormData"
            :onValue="currentField.onValue"
            :defaultValue="currentField.defaultValue"
            @onValue="onFieldValue"
            />
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
    modalController
} from "@ionic/vue"

export default defineComponent({
    components: {
        IonToolbar,
        IonContent,
        IonHeader,
        IonTitle,
        IonButton
    },
    props: {
        dismissType: {
            type: Object as PropType<'modal' | 'redirect'>,
            default: 'modal'
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
    computed: {
        helpText(): string {
            return this.currentField?.helpText
        }
    },
    data: () => ({
        valueClearIndex: 0 as number,
        formData: {} as any,
        computedFormData: {} as any,
        state: "" as string,
        value: null as Option | Option[] | null,
        disableBtn: false as boolean
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
