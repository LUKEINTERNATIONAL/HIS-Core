<template>
    <ion-page>
        <full-toolbar
            class="full-component-view"
            :appIcon="app.applicationIcon"
            :patientCardInfo="patientCardInfo"
            :programCardInfo="programCardInfo"
        />
        <minimal-toolbar
            class="mobile-component-view"
            :title="patientName"
            :menuTitle="visitDatesTitle"
            :menuItems="visitDates"
            :appIcon="app.applicationIcon"
            @onClickMenuItem="onActiveVisitDate"
        />

        <ion-toolbar class="mobile-component-view"> 
            <ion-segment :value="activeTab" mode="ios" class="ion-justify-content-center">
                <ion-segment-button value="1" @click="activeTab=1"> 
                    <ion-icon :icon="calendar"> </ion-icon>
                    <ion-label>Visits</ion-label>
                </ion-segment-button>
                <ion-segment-button value="2" @click="activeTab=2"> 
                    <ion-icon :icon="person"> </ion-icon>
                    <ion-label>Patient</ion-label>
                </ion-segment-button>
                <ion-segment-button value="3" @click="activeTab=3">
                    <ion-icon :icon="medical"> </ion-icon>
                    <ion-label>Program</ion-label>
                </ion-segment-button>
                <ion-segment-button value="4" @click="activeTab=4"> 
                    <ion-icon :icon="time"> </ion-icon>
                    <ion-label>Dates</ion-label>
                </ion-segment-button>
            </ion-segment>
        </ion-toolbar>

        <ion-toolbar class="mobile-component-view" v-if="nextTask.name"> 
            <ion-button 
                :style="{width: '100%'}" 
                color="success"
                @click="$router.push(nextTask)">
                <ion-label><b>Next Task{{ nextTask.name.toUpperCase() }}</b></ion-label>
                <ion-icon :icon="alertCircle"> </ion-icon>
            </ion-button>
        </ion-toolbar>

        <ion-content id="main-content">
            <!-- Mobile dashboard view -->
            <div class="mobile-component-view">
                <component
                    v-if="appHasCustomContent && activeTab === 1" 
                    v-bind:is="customDashboardContent"
                    :patient="patient"
                    :visitDate="activeVisitDate"
                    >  
                </component>
                <ion-grid v-if="!appHasCustomContent && activeTab === 1">
                    <ion-row>
                        <ion-col size="12"
                            v-for="(card, cardIndex) in patientCards"
                            :key="cardIndex"
                            >
                            <primary-card
                                :counter="card.items.length"
                                :icon="card.icon"
                                :title="card.label"
                                :titleColor="card.color"
                                :items="card.items"
                                @click="card.onClick"
                                > 
                            </primary-card>
                        </ion-col>
                    </ion-row>
                </ion-grid>
                <!-- Patient Information TAB --->
                <ion-list v-if="activeTab === 2">
                    <div class="his-card info-card-item"
                        v-for="(item, rIndex) in patientCardInfo" 
                        :key="rIndex"> 
                        <ion-item lines="none"> 
                            <ion-label> {{item.label}} </ion-label>
                            <ion-label slot="end"> <b>{{item.value}}</b> </ion-label>
                        </ion-item>
                    </div>
                </ion-list>
                <!-- Program Information TAB -->
                <ion-list v-if="activeTab === 3"> 
                    <div class="his-card info-card-item"
                        v-for="(item, rIndex) in programCardInfo" 
                        :key="rIndex">
                        <ion-item lines="none"> 
                            <ion-label> {{item.label}} </ion-label>
                            <ion-label slot="end"> <b>{{item.value}}</b> </ion-label>
                        </ion-item>
                        <p/>
                    </div>
                </ion-list>
                <!-- Dates TAB -->
                <ion-list v-if="activeTab === 4"> 
                    <div class="his-card info-card-item"> 
                        <ion-item lines="none"> 
                            <ion-label> Today </ion-label>
                            <ion-label slot="end"> <b>{{currentDate}}</b> </ion-label>
                        </ion-item>
                    </div>
                    <div class="his-card info-card-item">     
                        <ion-item lines="none"> 
                            <ion-label> Session </ion-label>
                            <ion-label slot="end"> <b>{{sessionDate}}</b> </ion-label>
                        </ion-item>
                    </div>
                    <div class="his-card info-card-item"> 
                        <ion-item lines="none"> 
                            <ion-label> Current visit date </ion-label>
                            <ion-label slot="end"> <b>{{activeVisitDate}}</b> </ion-label>
                        </ion-item>
                    </div>
                </ion-list>
            </div>
            <!-- RENDER DEFAULT PATIENT DASHBOARD -->
            <ion-grid v-if="!appHasCustomDashboard" class='full-component-view grid-custom vertically-align'>
                <ion-row>
                    <ion-col size="2.4">
                        <visit-dates-card :title="visitDatesTitle" :items="visitDates" @onselect="onActiveVisitDate"> </visit-dates-card>
                    </ion-col>
                    <ion-col size="9.6">
                        <div class="his-card"> 
                        <ion-row> 
                           <ion-col size-md="4" size-sm="6"> 
                               Today's Date: <b>{{ currentDate }}</b>
                            </ion-col> 
                            <ion-col size-md="4" size-sm="6"> 
                                <span v-if="nextTask.name"> 
                                    <ion-chip class="next-task" color="success" @click="$router.push(nextTask)">Next Task: {{ nextTask.name.toUpperCase() }}</ion-chip>
                                </span>
                                <span v-else> 
                                    Next Task: <b>NONE</b>
                                </span>
                            </ion-col>
                            <ion-col size-md="4" size-sm="12">
                                <span v-if="isBDE"> 
                                    <ion-chip :style="{marginTop: '-8px'}" color="danger" @click="$router.push({name: 'Session Date'})"><b> BDE: {{ sessionDate.toUpperCase() }}</b> </ion-chip>
                                </span>
                                <span v-else> 
                                    Set Date: <b>{{ sessionDate }}</b>
                                </span>
                            </ion-col>
                        </ion-row>
                        <!--Custom Dashboard content-->
                        <component
                            v-if="appHasCustomContent" 
                            v-bind:is="customDashboardContent"
                            :patient="patient"
                            :visitDate="activeVisitDate"
                            >  
                        </component>
                        <!--Default patient dashboard content-->
                        <div v-if="!appHasCustomContent">
                            <ion-row> 
                                <ion-col 
                                    size="6"
                                    v-for="(card, cardIndex) in patientCards"
                                    :key="cardIndex">
                                    <primary-card
                                        :counter="card.items.length"
                                        :icon="card.icon"
                                        :title="card.label"
                                        :titleColor="card.color"
                                        :items="card.items"
                                        @click="card.onClick"
                                        > 
                                    </primary-card>
                                </ion-col>
                            </ion-row>
                        </div>
                        </div>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
        <ion-footer> 
            <ion-toolbar color="dark">
                <ion-button class="full-component-view" color="primary" size="large" slot="end" @click="showTasks"> 
                    <ion-icon :icon="clipboardOutline"> </ion-icon>
                    Tasks
                </ion-button>
                <ion-button class="mobile-component-view" color="primary" size="medium" slot="end" @click="showTasks"> 
                    <ion-icon :icon="clipboard"> </ion-icon>
                </ion-button>
                <ion-button class="full-component-view" color="primary" size="large" slot="end" @click="showOptions">
                    <ion-icon :icon="folderOutline"> </ion-icon>
                    Printouts/Other
                </ion-button>
                <ion-button class="mobile-component-view" color="primary" size="medium" slot="end" @click="showOptions">
                    <ion-icon :icon="folder"> </ion-icon>
                </ion-button>
                <ion-button class="full-component-view" color="primary" size="large" slot="end" @click="changeApp"> 
                    <ion-icon :icon="appsOutline"> </ion-icon>
                    Applications
                </ion-button>
                <ion-button class="mobile-component-view" color="primary" size="medium" slot="end" @click="changeApp"> 
                    <ion-icon :icon="apps"> </ion-icon>
                </ion-button>
                <ion-button class="full-component-view" color="success" size="large" slot="end" @click="onCancel">
                    <ion-icon :icon="logOutOutline"> </ion-icon>
                    Finish
                </ion-button>
                <ion-button class="mobile-component-view" color="success" size="medium" slot="end" @click="onCancel">
                    <ion-icon :icon="logOut"> </ion-icon>
                </ion-button>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>
<script lang="ts">
import HisApp from "@/apps/app_lib"
import { defineComponent } from 'vue'
import PrimaryCard from "@/components/DataViews/DashboardPrimaryCard.vue"
import VisitDatesCard from "@/components/DataViews/VisitDatesCard.vue"
import HisDate from "@/utils/Date"
import { Encounter } from "@/interfaces/encounter"
import { Option } from "@/components/Forms/FieldInterface"
import { Patient } from "@/interfaces/patient";
import { Patientservice } from "@/services/patient_service"
import { ProgramService } from "@/services/program_service"
import { ObservationService } from "@/services/observation_service"
import { DrugOrderService } from "@/services/drug_order_service"
import { OrderService } from "@/services/order_service"
import TaskSelector from "@/components/DataViews/TaskSelectorModal.vue"
import EncounterView from "@/components/DataViews/DashboardEncounterModal.vue"
import CardDrilldown from "@/components/DataViews/DashboardTableModal.vue"
import { WorkflowService } from "@/services/workflow_service"
import { toastSuccess, toastDanger, alertConfirmation } from "@/utils/Alerts";
import _, { isEmpty } from "lodash"
import MinimalToolbar from "@/components/PatientDashboard/Poc/MinimalToolbar.vue"
import FullToolbar from "@/components/PatientDashboard/Poc/FullToolbar.vue"
import {
    man,
    time,
    person,
    calendar,
    medical,
    woman,
    clipboardOutline, 
    appsOutline, 
    folderOutline,
    logOutOutline, 
    clipboard, 
    apps, 
    folder,
    logOut,
    alertCircle,
    timeOutline, 
    warningOutline 
} from "ionicons/icons";
import {
  IonSegment,
  IonSegmentButton,
  IonPage,
  IonIcon,
  IonChip,
  IonContent,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonFooter,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { EncounterService } from '@/services/encounter_service'
export default defineComponent({
    components: {
        IonSegment,
        IonSegmentButton,
        FullToolbar,
        MinimalToolbar,
        VisitDatesCard,
        PrimaryCard,
        IonChip,
        IonPage,
        IonIcon,
        IonFooter,
        IonContent,
        IonButton,
        IonToolbar,
        IonGrid,
        IonRow,
        IonCol,
    },
    setup() {
        return {
            man,
            time,
            person,
            calendar,
            medical,
            woman,
            clipboard, 
            apps, 
            folder,
            logOut, 
            timeOutline, 
            warningOutline,
            clipboardOutline, 
            appsOutline, 
            folderOutline,
            logOutOutline,
            alertCircle
        }
    },
    data: () => ({
        activeTab: 1 as number,
        app: ProgramService.getActiveApp() as any,
        dashboardComponent: {} as any,
        isBDE: false as boolean,
        currentDate: '',
        sessionDate: '',
        nextTask: {} as any,
        patientId: 0,
        programID : 0,
        patient: {} as any,
        patientProgram: {} as any,
        patientCardInfo: [] as Array<Option>,
        programCardInfo: [] as Array<Option> | [],
        encounters: [] as Array<Encounter>,
        medications: [] as any,
        labOrders: [] as any,
        visitDates: [] as Array<Option>,
        activeVisitDate: '' as string | number,
        encountersCardItems: [] as Array<Option>,
        medicationCardItems: [] as Array<Option>,
        labOrderCardItems: [] as Array<Option>,
        alertCardItems: [] as Array<Option>,
        patientCards: [] as Array<any>
    }),
    computed: {
        patientName(): string {
            return !isEmpty(this.patient) 
                ? this.patient.getFullName()
                : 'N/A'
        },
        appHasCustomContent(): boolean {
            return !_.isEmpty(this.app.customPatientDashboardContentComponent)
                ? true
                : false
        },
        customDashboardContent(): any {
            return this.app.customPatientDashboardContentComponent
        },
        visitDatesTitle(): string {
            return `${this.visitDates.length} Visits`
        }
    },
    watch: {
        "$route" : {
            async handler({params}: any) {
                if (!params) return

                this.patientId = parseInt(params.id)

                if (this.patientId) await this.init()
            },
            deep: true,
            immediate: true
        },
        async activeVisitDate(date: string) {
            if (!(this.appHasCustomContent)) {
                this.encounters = await EncounterService.getEncounters(this.patientId, {date})
                this.medications = await DrugOrderService.getOrderByPatient(this.patientId, {'start_date': date})
                this.labOrders = await OrderService.getOrders(this.patientId, {date})
                this.encountersCardItems = this.getActivitiesCardInfo(this.encounters)
                this.medicationCardItems = this.getMedicationCardInfo(this.medications)
                this.labOrderCardItems = this.getLabOrderCardInfo(this.labOrders)
                this.updateCards()
            }
        }
    },
    methods: {
        async init() {
            this.patient = await this.fetchPatient(this.patientId)
            this.patientProgram = await ProgramService.getProgramInformation(this.patientId)
            this.patientCardInfo = this.getPatientCardInfo(this.patient)
            this.programCardInfo = await this.getProgramCardInfo(this.patientProgram) || []
            this.currentDate = HisDate.currentDisplayDate()
            this.sessionDate = this.toDate(ProgramService.getSessionDate())
            this.isBDE = ProgramService.isBDE() || false
            this.nextTask = await this.getNextTask(this.patientId)
            this.visitDates = await this.getPatientVisitDates(this.patientId)
            this.alertCardItems = await this.getPatientAlertCardInfo() || []
            this.programID = ProgramService.getProgramID()
            this.updateCards()
        },
        toDate(date: string | Date) {
            return HisDate.toStandardHisDisplayFormat(date)
        },
        toTime(date: string | Date) {
            return HisDate.toStandardHisTimeFormat(date)
        },
        updateCards() {
            this.patientCards = [
                this.activitiesCard(),
                this.labOrderCard(),
                this.alertsCard(),
                this.medicationCard(),
            ]
        },
        activitiesCard() {
            return {
                label: 'Activities',
                items: this.encountersCardItems,
                icon: timeOutline,
                color: '#658afb',
                onClick: () => this.openModal(
                    this.encountersCardItems, 
                    'Select Activities', 
                    EncounterView
                )
            }
        },
        labOrderCard() {
            const label = 'Lab Orders'
            return {
                label,
                color: '#69bb7b',
                icon: timeOutline,
                items: this.labOrderCardItems,
                onClick: () => {
                    const columns = ['Accession#',  'Specimen', 'Time']
                    const rows = this.labOrders.map((order: any) => ([
                        order.accession_number, 
                        order.specimen.name,
                        this.toTime(order.order_date)
                    ]))
                    this.openTableModal(columns, rows, `Lab Orders`)
                }
            }
        },
        alertsCard() {
            return {
                label: 'Alerts',
                color: '#f95d5d',
                icon: warningOutline,
                items: this.alertCardItems,
                onClick: () => { /* TODO, list all alerts */ }
            }
        },
        medicationCard() {
            return {
                label: 'Medications',
                color: '#fdb044',
                icon: timeOutline,
                items: this.medicationCardItems,
                onClick: () => {
                    const columns = ['Medication', 'Start date', 'End date', 'Amount given']
                    const rows = this.medications.map((medication: any) => ([
                        medication.drug.name, 
                        this.toDate(medication.order.start_date),
                        this.toDate(medication.order.auto_expire_date),
                        medication.quantity
                    ]))
                    this.openTableModal(columns, rows, 'Medication History')
                }
            }
        },
        async fetchPatient(patientId: number | string){
            const patient: Patient = await Patientservice.findByID(patientId);
            return patient ? new Patientservice(patient): {}
        },
        async getPatientVisitDates(patientId: number) {
            const dates = await Patientservice.getPatientVisits(patientId)
            return dates.map((date: string) => ({
                label: this.toDate(date), value: date
            }))
        },
        async getNextTask(patientId: number) {
            return await WorkflowService.getNextTaskParams(patientId)
        },
        onActiveVisitDate(data: Option) {
            this.activeVisitDate = data.value
        },
        getPatientCardInfo(patient: any) {
            const birthDate = patient.getBirthdate() //this.getProp(patient, 'getBirthdate')
            const genderIcon = patient.getGender() === 'M' ? man : woman
            return [
                { label: "Name", value: patient.getFullName(), other: { icon: genderIcon}},
                { label: "Birthdate", value: `
                    ${this.toDate(birthDate)}
                    (${patient.getAge()}) 
                    (${patient.getNationalID()})`
                },
                { label: "Current Village", value: patient.getCurrentVillage() },
                { label: "Phone#", value: patient.getPhoneNumber()}
            ]
        },
        getProgramCardInfo(info: any) {
           if ('formatPatientProgramSummary' in this.app) {
             return this.app.formatPatientProgramSummary(info)
           }
        },
        getActivitiesCardInfo(encounters: Array<Encounter>) {
            return encounters.map((encounter: Encounter) => ({
                label: encounter.type.name,
                value: this.toTime(encounter.encounter_datetime),
                other: {
                    id: encounter.encounter_id,
                    columns: ['Observation', 'Value', 'Time'],
                    onVoid: async (reason: any) => {
                        try {
                            await EncounterService.voidEncounter(encounter.encounter_id, reason)
                            _.remove(this.encountersCardItems, { label: encounter.type.name })
                            this.updateCards()
                            this.nextTask = await this.getNextTask(this.patientId)
                            toastSuccess('Encounter has been voided!', 3000)
                        }catch(e) {
                            toastDanger('Unable to void encounter!')
                        }
                    },
                    getRows: async () => {
                        const data = []
                        const { observations } = encounter
                        for(const index in observations) {
                            const obs =  observations[index]
                            const concept = obs.concept.concept_names[0].name
                            const value = await ObservationService.resolvePrimaryValue(obs)
                            const time = HisDate.toStandardHisTimeFormat(obs.obs_datetime)
                            data.push([concept, value, time])
                        }
                        return data
                    }
                }
            }))
        },
        getMedicationCardInfo(medications: any) {
            return medications.map((medication: any) => ({
                label: medication.drug.name,
                value: this.toTime(medication.order.start_date),
            }))
        },
        getLabOrderCardInfo(labOrders: any) {
            return labOrders.map((labOrder: any) => ({
                label: labOrder.specimen.name,
                value: this.toTime(labOrder.order_date)
            }))
        },
        async getPatientAlertCardInfo(){
            if ('getPatientDashboardAlerts' in this.app) {
                return this.app.getPatientDashboardAlerts(this.patient)
            }
        },
        async changeApp() {
            const app = await HisApp.selectApplication();

            if (!app) return

            if (app.programID != this.programID){
                return this.$router.push(`/patients/confirm?person_id=${this.patientId}`)
            } else {
                await this.init()
            }
        },
        async showTasks() {
            if ('primaryPatientActivites' in this.app) {
                const encounters = this.app.primaryPatientActivites
                this.openModal(encounters, 'Select Task', TaskSelector)
            }
        },
        async showOptions() {
            if ('secondaryPatientActivites' in this.app) {
                const other = this.app.secondaryPatientActivites
                this.openModal(other, 'Select Activity', TaskSelector)
            }
        },
        async openModal(items: any, title: string, component: any) {
            const date = this.toDate(this.activeVisitDate.toString())
            const modal = await modalController.create({
                component: component,
                backdropDismiss: false,
                cssClass: "large-modal",
                componentProps: {
                    items,
                    title: `${title}: ${date}`,
                    taskParams: { 
                        patient: this.patient.getObj(), 
                        program: this.patientProgram,
                        visitDate: this.activeVisitDate,
                        patientID: this.patientId
                    }
                }
            })
            modal.present()
        },
        async openTableModal(columns: any, rows: any, title: string) {
            const date = this.toDate(this.activeVisitDate.toString())
            const modal = await modalController.create({
                component: CardDrilldown,
                backdropDismiss: false,
                cssClass: "custom-modal",
                componentProps: {
                    columns,
                    rows,
                    title: `${title}: ${date}`
                }
            })
            modal.present()
        },
        async onCancel() {
            const confirmation = await alertConfirmation('Are you sure you want to cancel?')
            
            if (confirmation) return this.$router.push({path: '/'})
        }
    }
})
</script>
<style scoped>
    ion-icon {
        padding: 0.2em;
    }
    .info-card-item {
        height: 100%!important;
        margin: 1.2em;
    }
    .full-component-view {
        display: block;
    }
    .mobile-component-view {
        display: none;
    }
    .next-task {
        margin-top: -8px;
        font-weight: 600;
        font-size: 0.74em;
    }

    .grid-custom {
        overflow-y: auto;
        font-size: 0.9em;
    }

    .his-card {
        height: 75vh;
        padding: 1.0%;
    }

    @media (max-width:900px) {
        .full-component-view {
            display: none;
        }
        .mobile-component-view {
            display: block;
        }
    }

    @media (min-width: 1278px) {
        .next-task {
            font-size: 1.0em;
        }
        .grid-custom {
            padding: 0.4%;
            height: 99%;
        }
    }
    @media only screen and (width: 1024px) {
        .grid-custom {
            height: 99%;
            overflow: hidden;
        }   
    }
</style>