<template>
    <ion-page> 
        <ion-header> 
            <ion-toolbar>
                <ion-row> 
                    <ion-col> 
                        <h2>Merge Clients</h2>
                    </ion-col>
                </ion-row>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <view-port>
                <ion-row> 
                    <ion-col>
                        <ion-input
                            @click="inputFocus='inputA'"
                            placeholder="Primary patient"
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
                            placeholder="Secondary patient"
                            v-model="inputB"
                            :class="{
                                'input-focused': 'inputB' === inputFocus
                            }"> 
                        </ion-input>
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <div class="result-section">
                            <patient-card
                                @click="onPrimaryPatient(patientA)"
                                v-for="(patientA, aIndex) in inputASearchResults" :key="aIndex"
                                :patient="patientA"
                                :isActive="activeInputACard.index === aIndex"
                                >
                            </patient-card>
                        </div> 
                    </ion-col>
                    <ion-col> 
                        <div class="result-section">
                            <patient-card
                                @click="onSecondaryPatient(patientB)"
                                v-for="(patientB, bIndex) in inputBSearchResults" :key="bIndex"
                                :patient="patientB"
                                :isActive="patientB.isChecked"
                                >
                            </patient-card>
                        </div>
                    </ion-col>
                </ion-row>
            </view-port>
            <his-keyboard v-if="inputFocus" :kbConfig="keyboard" :onKeyPress="keypress"> </his-keyboard>
        </ion-content>
        <ion-footer> 
            <ion-toolbar color="dark">
                <ion-button color="danger" size="large" router-link="/"> 
                    Cancel
                </ion-button>
                <ion-button v-if="canMerge" color="success" size="large" slot="end" @click="onMerge"> 
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
import  PatientCard from "@/components/DataViews/ArtPatientCard.vue"
import {PatientPrintoutService} from "@/services/patient_printout_service"
import { alertConfirmation, toastDanger } from "@/utils/Alerts"
import { WorkflowService } from "@/services/workflow_service"

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
import { isEmpty } from 'lodash';
export default defineComponent({
    components: { PatientCard, IonPage, IonInput, IonButton, IonContent, IonRow, IonCol, IonFooter, IonHeader, ViewPort, HisKeyboard },
    data: () => ({
        inputA: '' as string,
        inputB: '' as string,
        inputFocus: 'inputA' as 'inputA' | 'inputB' | '',
        inputASearchResults: [] as Array<any>,
        inputBSearchResults: [] as Array<any>,
        activeInputACard: {} as any,
        keyboard: [
            CHARACTERS_AND_NUMBERS_LO, 
            [
                ['','Hide'],
                ['Space', 'Delete'],
                ['inputA', 'inputB'],
                ['Search', 'Clear']
            ]
        ] as any
    }),
    computed: {
        canMerge(): boolean {
            return (!isEmpty(this.activeInputACard) 
                && !isEmpty(this.inputBSearchResults.filter((b: any) => b.isChecked)))
        }
    },
    methods: {
        async onMerge() {
            try {
                const payload = {
                    'primary': {
                        'patient_id': this.activeInputACard.id,
                        'doc_id': null
                    },
                    'secondary': this.inputBSearchResults.map((s: any) => ({
                        'patient_id': s.id,
                        'doc_id': null
                    }))
                }
                await Patientservice.mergePatients(payload)
                const print = new PatientPrintoutService(this.activeInputACard.id)
                await print.printNidLbl()
                this.inputBSearchResults = this.inputBSearchResults.filter(
                    (r: any) => !r.isChecked
                )
                const confrm = await alertConfirmation('Do you want to go to patient encounter?')
                if (confrm) {
                    const workflow: any = await WorkflowService.getNextTaskParams(this.activeInputACard.id)
                    if (workflow.name) {
                        this.$router.push(workflow)
                    } else {
                        this.$router.push(`/patient/dashboard/${this.activeInputACard.id}`)
                    }
                }
            }catch(e) {
                toastDanger(e)
            }

        },
        onPrimaryPatient(patient: any) {
            this.inputBSearchResults.forEach((i: any) => {
                if (i.id === patient.id) {
                    this.inputBSearchResults[i.index].isChecked = false
                }
            })
            this.activeInputACard = patient
        },
        onSecondaryPatient(patient: any) {
            if (patient.isChecked) {
                return this.inputBSearchResults[patient.index].isChecked = false
            }
            if (!isEmpty(this.activeInputACard) 
                && patient.id != this.activeInputACard.id) {
                this.inputBSearchResults[patient.index].isChecked = true
            }
        },
        async searchPatient(text: string) {
            const [givenName, familyName] = text.split(' ')
            const patients = await Patientservice.search({
                'given_name': givenName,
                'family_name': familyName
            })
            return patients.map((p: any, i: number) => {
                const patient = new Patientservice(p)
                return {
                    index: i,
                    id: patient.getID(),
                    name: patient.getFullName(),
                    birthdate: patient.getBirthdate(),
                    arvNum: patient.getArvNumber(),
                    gender: patient.getGender(),
                    homeDistrict: patient.getHomeDistrict(),
                    homeVillage: patient.getHomeVillage(),
                    currentDistrict: patient.getCurrentDistrict(),
                    currentVillage: patient.getCurrentVillage(),
                    isChecked: false
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
                    this.activeInputACard = {}
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
                if (this.inputFocus === 'inputA') {
                    this.inputASearchResults = []
                } else {
                    this.inputBSearchResults = []
                }
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
    .result-section {
        overflow-y: auto;
        height: 70vh;
    }
</style>