<template>
    <ion-page> 
        <ion-content>
            <h1 class="ion-text-center"> 
                <span v-show="highBP">High</span> BP Alert 
            </h1>
            <h1 v-if="!hasPressureReading" class="vertically-align ion-text-center"> 
                No Blood pressure reading found for <span class="name">{{ patientName }}</span>...
            </h1>
            <div v-if="hasPressureReading" class="vertically-align ion-text-center">
                <h2 v-show="patientOnBpDrugs" style="font-weight:bold;">
                    (Patient already on BP drugs)
                </h2>
                <h2>
                    <span class="name"> {{ patientName }} </span> has <span v-show="highBP"> a high </span> blood pressure of 
                    <span class="bp"> 
                        {{sysBp}} / {{dsBP}}
                    </span>
                    <br/>
                    <span v-show="highBP">
                        Retesting BP is <span style="font-weight: bold; color: #000000;text-decoration: underline;">optional</span>. <br>
                        Do you want to test BP?
                    </span>

                </h2>
            </div>
        </ion-content>
        <ion-footer> 
            <ion-toolbar color="dark">
                <ion-button @click="gotoPatientDashboard"
                    size="large"
                    color="danger"
                    slot="start">
                    Cancel
                </ion-button>
                <ion-button v-if="highBP || !hasPressureReading" 
                    @click="recaptureBp"
                    size="large" 
                    color="success" 
                    slot="end">
                    <span v-if="highBP"> Re-test </span>
                    <span v-if="!hasPressureReading">Capture BP</span>
                </ion-button>
                <ion-button v-if="highBP" 
                    :router-link="`/art/encounters/bp_management/${patientID}`"
                    size="large"
                    color="warning"
                    slot="end">
                    <span v-if="highBP"> Manage BP </span>
                </ion-button>
                <ion-button
                    v-if="!highBP"
                    @click="nextTask"
                    size="large"
                    color="success"
                    slot="end">
                    Continue
                </ion-button>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
    
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import EncounterMixinVue from './EncounterMixin.vue'
import {
    IonFooter,
    IonContent,
    IonPage,
    IonButton,
    IonToolbar,
    loadingController
} from "@ionic/vue"
import ART_PROP from "@/apps/ART/art_global_props"
import { BPManagementService } from '../../services/htn_service'
export default defineComponent({
    mixins: [EncounterMixinVue],
    components: { 
        IonFooter,
        IonContent,
        IonPage,
        IonButton,
        IonToolbar
    },
    data: () => ({
        sysBp: 0 as number,
        dsBP: 0 as number,
        patientOnBpDrugs: false as boolean,
        isPregnant: false as boolean,
        systolicThreshold: 145,
        diastolicTheshold: 94
    }),
    methods: {
        recaptureBp() {
            this.$router.push(`/art/encounters/vitals/${this.patientID}`)
        }
    },
    watch: {
        ready: {
            async handler(r: boolean) {
                if (!r) return
                const loading = await loadingController.create({
                    message: 'Verifying Blood Pressure...',
                    backdropDismiss: false
                })
                await loading.present()
                const htn = new BPManagementService(this.patientID, this.providerID)
                this.systolicThreshold = (await ART_PROP.systolicThreshold()) || 145
                this.diastolicTheshold = (await ART_PROP.diastolicThreshold()) || 94
                this.dsBP = (await htn.getDiastolicBp()) || 0
                this.sysBp = (await htn.getSystolicBp()) || 0
                this.patientOnBpDrugs = (await htn.onBpDrugs()) || false
                this.isPregnant = this.patient.isChildBearing()
                    ? (await this.patient.isPregnant()) || false
                    : false
                loadingController.dismiss()
            },
            immediate: true
        }
    },
    computed: {
        patientName(): string {
            return this.ready ? this.patient.getFullName() : 'Patient'
        },
        hasPressureReading(): boolean {
            return this.sysBp > 0 && this.dsBP > 0
        },
        highBP(): boolean {
            return this.sysBp >= this.systolicThreshold 
                && this.dsBP >= this.diastolicTheshold
                && !this.isPregnant
        }
    }
})
</script>

<style scoped>
    div {
        color: gray;
    }
    .bp{
        color: red;
        font-style: italic;
    }
    .name{
        color: blue;
        font-style: italic;
    }
    .green{
        width: 170px;
    }

</style>