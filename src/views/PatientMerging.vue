<template>
    <ion-page> 
        <ion-header> 
            <ion-toolbar>
                <h2>Merge Clients</h2>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <view-port>
                <ion-row> 
                    <ion-col class="seperator-border"> 
                        <ion-input
                            @click="inputFocus='inputA'"
                            class="input_display"
                            v-model="inputA"
                            :class="{
                                'input-focused': 'inputA' === inputFocus
                            }"
                        > 
                        </ion-input>
                    </ion-col>
                    <ion-col> 
                        <ion-input 
                            @click="inputFocus='inputB'"
                            class="input_display"
                            v-model="inputB"
                            :class="{
                                'input-focused': 'inputB' === inputFocus
                            }"
                            > 
                        </ion-input>
                    </ion-col>
                </ion-row>
                <ion-row> 
                    <ion-col class="seperator-border"> 
                        
                    </ion-col>
                    <ion-col> 

                    </ion-col>
                </ion-row>
            </view-port>
            <his-keyboard v-if="inputFocus" :kbConfig="keyboard" :onKeyPress="keypress" :disabled="false"> </his-keyboard>
        </ion-content>
        <ion-footer> 
            <ion-toolbar color="dark">
                <ion-button color="danger" size="large" @click="onCancel"> 
                    Cancel
                </ion-button>
                <ion-button color="success" size="large" slot="end" @click="changeApp"> 
                    Merge
                </ion-button>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ViewPort from "@/components/DataViews/ViewPort.vue"
import HisKeyboard from "@/components/Keyboard/HisKeyboard.vue"
import { CHARACTERS_AND_NUMBERS_LO } from "@/components/Keyboard/KbLayouts";
import handleVirtualInput from "@/components/Keyboard/KbHandler"
import {
    IonPage,
    IonContent,
    IonHeader,
    IonRow,
    IonCol,
    IonInput,
    IonFooter,
    IonButton,
} from "@ionic/vue"
export default defineComponent({
    components: { IonPage, IonInput, IonButton, IonContent, IonRow, IonCol, IonFooter, IonHeader, ViewPort, HisKeyboard },
    data: () => ({
        inputA: '' as string,
        inputB: '' as string,
        inputFocus: '' as 'inputA' | 'inputB' | '',
        keyboard: [
            CHARACTERS_AND_NUMBERS_LO, 
            [
                ['Search', 'Space'],
                ['Delete', 'Hide']
            ]
        ] as any
    }),
    methods: {
        keypress(text: string) {
            if (!this.inputFocus) {
                return
            }
            const input = handleVirtualInput(text, this[this.inputFocus])
            if (input.match(/hide/i)) {
                this.inputFocus = ''
            } else {
                this[this.inputFocus] = input
            }
        }
    }
})
</script>
<style scoped>
    .input-focused {
        color: #3880ff;
        border-bottom: 3px solid #3880ff;
    }
</style>