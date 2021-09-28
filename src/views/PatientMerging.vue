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
                            placeholder="Primary patient (INPUTA)"
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
                            placeholder="Secondary Patient (INPUTB)"
                            v-model="inputB"
                            :class="{
                                'input-focused': 'inputB' === inputFocus
                            }"> 
                        </ion-input>
                    </ion-col>
                </ion-row>
                <ion-row> 
                    <ion-col> 
                        
                    </ion-col>
                    <ion-col> 

                    </ion-col>
                </ion-row>
            </view-port>
            <his-keyboard v-if="inputFocus" :kbConfig="keyboard" :onKeyPress="keypress"> </his-keyboard>
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
import { Patientservice } from "@/services/patient_service"

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
        inputFocus: 'inputA' as 'inputA' | 'inputB' | '',
        inputASearchResults: [] as Array<any>,
        inputBSearchResults: [] as Array<any>,
        keyboard: [
            CHARACTERS_AND_NUMBERS_LO, 
            [
                ['Search', 'Hide'],
                ['Space', 'Delete'],
                ['inputA', 'inputB'],
                ['Clear']
            ]
        ] as any
    }),
    methods: {
        async searchPatient(text: string) {
            const [givenName, familyName] = text.split(' ')
            const patients = await Patientservice.search({
                'given_name': givenName,
                'family_name': familyName
            })
            return patients.map((p: any) => {
                const patient = new Patientservice(p)
                return {
                    id: patient.getID(),
                    name: patient.getFullName(),
                    birthdate: patient.getBirthdate(),
                    arvNum: patient.getArvNumber(),
                    gender: patient.getGender(),
                    homeDistrict: patient.getHomeDistrict(),
                    homeVillage: patient.getHomeVillage(),
                    currentDistrict: patient.getCurrentDistrict(),
                    currentVillage: patient.getCurrentVillage(),
                }
            })
        },
        async keypress(text: string) {
            if (!this.inputFocus) {
                return
            }
            let input = handleVirtualInput(text, this[this.inputFocus])
            if (input.match(/hide/i)) {
                this.inputFocus = ''
            } else if (input.match(/search/i)) {
                input = input.replace('Search', '')
                if (this.inputFocus === 'inputA') {
                    this.inputASearchResults = await this.searchPatient(input)
                } else {
                    // Run search query
                    this.inputBSearchResults = await this.searchPatient(input)
                }
                this.inputFocus = ''
            } else if(input.match(/inputA/i)) {
                this.inputFocus = 'inputA'
            } else if (input.match(/inputB/)) {
                this.inputFocus = 'inputB'
            } else if (input.match(/clear/i)) {
                this[this.inputFocus] = ''
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