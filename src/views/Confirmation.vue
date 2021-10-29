<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-row> 
          <ion-col> 
            <div class="tool-bar-medium-card"> 
              Patient Name: <b> {{demographics.patientName}}</b> <p/>
              Birthdate: <b> {{birthdate}} </b> <p/>
              Gender:  <b>{{demographics.gender}} </b>
            </div>
          </ion-col>
          <ion-col> 
            <div class="tool-bar-medium-card"> 
              Ancestry district: <b>{{ demographics.ancestryDistrict }}</b> <p/>
              Ancestry TA: <b>{{ demographics.ancestryTA }}</b> <p/>
              Ancestry village: <b>{{ demographics.ancestryVillage }}</b> <p/>
            </div>
          </ion-col>
          <ion-col> 
            <div class="tool-bar-medium-card"> 
              Current District: <b> {{ demographics.currentDistrict }}</b><p/>
              Current TA: <b> {{ demographics.currentTA }}</b><p/>
              Current Village: <b> {{ demographics.currentVillage }}</b><p/>
            </div>
          </ion-col>
        </ion-row>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-row>
        <ion-col size="4" v-for="(card, index) in cards" :key="index">
          <ion-card class="his-card">
            <ion-card-header>
              <ion-card-title>{{ card.title.toUpperCase() }}</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ul class="card-content"> 
                <li class='li-item' v-for="(info, id) in card.data" :key="id"> 
                  <span v-if="info.label"> {{ info.label }} &nbsp;</span>
                  <strong>{{ info.value }} </strong>
                </li>
              </ul>
            </ion-card-content>
          </ion-card>
        </ion-col>
      </ion-row>
    </ion-content>

    <ion-footer>
      <ion-toolbar color="dark">
        <ion-button color="danger" size="large" router-link="/"
          >Cancel</ion-button>
        <ion-button
          color="danger left"
          size="large"
          @click="onVoid"
          v-if="isAdmin"
          >Void</ion-button
        >
        <ion-button slot="end" color="success" size="large" @click="nextTask">
          Continue
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import { isEmpty } from "lodash";
import HisDate from "@/utils/Date"
import HisApp from "@/apps/app_lib"
import { defineComponent } from "vue";
import { voidWithReason } from "@/utils/VoidHelper"
import { nextTask } from "@/utils/WorkflowTaskHelper"
import { UserService } from "@/services/user_service";
import { matchToGuidelines } from "@/utils/GuidelineEngine"
import { Patientservice } from "@/services/patient_service";
import { PatientProgramService } from "@/services/patient_program_service"
import { alertAction, alertConfirmation, toastDanger } from "@/utils/Alerts"

import {
  IonContent,
  IonHeader,
  IonFooter,
  IonPage,
  IonToolbar,
  IonRow,
  IonCol,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonCardHeader,
  loadingController
} from "@ionic/vue";
import {
  FlowState, 
  TargetEvent,
  CONFIRMATION_PAGE_GUIDELINES
} from "@/guidelines/confirmation_page_guidelines"
import { PatientPrintoutService } from "@/services/patient_printout_service";
import { AppInterface } from "@/apps/interfaces/AppInterface";
import { GlobalPropertyService } from "@/services/global_property_service"
import { PatientDemographicsExchangeService } from "@/services/patient_demographics_exchange_service"

export default defineComponent({
  name: "Patient Confirmation",
  components: {
    IonContent,
    IonHeader,
    IonFooter,
    IonPage,
    IonToolbar,
    IonRow,
    IonCol,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardTitle,
    IonCardHeader
  },
  data: () => ({
    app: {} as AppInterface,
    program: {} as any,
    patient: {} as any,
    cards: [] as any[],
    ddeInstance: {} as any,
    useDDE: false as boolean,
    facts: {
      npidHasDuplicates: false as boolean,
      userRoles: [] as string[],
      scannedNpid: '' as string,
      currentNpid: '' as string,
      programName: 'N/A' as string,
      currentOutcome: '' as string,
      programs: [] as string[],
      identifiers: [] as string[],
      dde: {
        hasDemographicConflict: false,
        localDiffs: {},
        diffColumnsAndRows: [],
      } as any,
      demographics: {
        givenName: '' as string,
        familyName: '' as string,
        patientName: '' as string,
        landmark: '' as string,
        phoneNumber: '' as string,
        currentDistrict: '' as string,
        currentTA: '' as string,
        currentVillage: '' as string,
        ancestryDistrict: '' as string,
        ancestryTA: '' as string,
        ancestryVillage: '' as string,
        gender: '' as string,
        birthdate: '' as string,
      },
      globalProperties: {
        useFilingNumbers: 'use_filing_numbers=true',
        ddeEnabled: 'dde_enabled=true'
      } as any
    }
  }),
  created() {
    const app = HisApp.getActiveApp()
    if (app) this.app = app
  },
  computed: {
    demographics(): any {
      return this.facts.demographics
    },
    birthdate(): string {
      return HisDate.toStandardHisDisplayFormat(
        this.facts.demographics.birthdate
      )
    },
    isAdmin() {
      return UserService.isAdmin()
    }
  },
  watch: {
    $route: {
      async handler({query}: any) {
        if (!isEmpty(query) && (
          query.person_id || query.patient_barcode
        )) {
          await this.findAndSetPatient(
            query.person_id, query.patient_barcode
          )
        }
      },
      immediate: true
    },
    async patient() {
      this.program = new PatientProgramService(this.patient.getID())
      await this.presentLoading()
      this.setPatientFacts()
      await this.resolveGlobalPropertyFacts()
      await this.setProgramFacts()
      if (this.useDDE) await this.setDDEFacts()
      await this.drawPatientCards()
      loadingController.dismiss()
      await this.onEvent(TargetEvent.ONLOAD)
    }
  },
  methods: {
    /**
     * Resolve patient by either patient ID or NpID.
     * Note: DDE Service only supports NPID search.
    */
    async findAndSetPatient(id: any, npid: any) {
      let data: any = {}
      await this.presentLoading()

      if (npid) {
        this.ddeInstance = new PatientDemographicsExchangeService()
        await this.ddeInstance.loadDDEStatus()        
        this.useDDE = this.ddeInstance.isEnabled()
        const results = await this.ddeInstance.searchNpid(npid)
        this.facts.scannedNpid = npid
        this.facts.npidHasDuplicates = results.length > 1
        data = results[0]
      } else if (id) {
        data = await Patientservice.findByID(id)
      }

      await loadingController.dismiss()

      if (isEmpty(data)) {
        return alertAction('Patient not found', [
          {
            text: 'Home',
            handler: () => this.$router.push('/')
          },
          {
            text: 'Back',
            handler: () => this.$router.back()
          }
        ])
      }
      loadingController.dismiss()
      this.patient = new Patientservice(data)
    },
    /**
     * Facts are used by the Guideline Engine to crosscheck 
     * conditions to execute. The more the data the better
     * the decision support. These facts are also presented 
     * on the User interface
    */
    setPatientFacts() {
      this.facts.demographics.patientName = this.patient.getFullName()
      this.facts.demographics.givenName = this.patient.getGivenName()
      this.facts.demographics.familyName = this.patient.getFamilyName()
      this.facts.demographics.landmark = this.patient.getAttribute(19)
      this.facts.demographics.phoneNumber = this.patient.getAttribute(12)
      this.facts.demographics.gender = this.patient.getGender()
      this.facts.demographics.birthdate = this.patient.getBirthdate()
      this.facts.demographics.ancestryDistrict = this.patient.getHomeDistrict()
      this.facts.demographics.ancestryTA = this.patient.getHomeTA()
      this.facts.demographics.ancestryVillage = this.patient.getHomeVillage()
      this.facts.demographics.currentDistrict = this.patient.getCurrentDistrict()
      this.facts.demographics.currentTA = this.patient.getCurrentTA()
      this.facts.demographics.currentVillage = this.patient.getHomeVillage()
      this.facts.identifiers = this.patient.getIdentifiers()
        .map((id: any) => id.type.name)
      this.facts.currentNpid = this.patient.getNationalID()
    },
    async resolveGlobalPropertyFacts() {
      for(const i in this.facts.globalProperties) {
        this.facts.globalProperties[i] = await GlobalPropertyService.isProp(
          this.facts.globalProperties[i]
        )
      }
    },
    async setProgramFacts() {
      const { program, outcome }: any =  await this.program.getProgram()
      this.facts.currentOutcome = outcome
      this.facts.programName = program
      this.facts.userRoles = UserService.getUserRoles().map((r: any) => r.role)
    },
    /**
     * Set dde facts if service is enabled.
     * Please Note that DDE has to be configured per Program in the backend.
     * If a program isnt configured for DDE, it crashes by default hence 
     * exception handling is required
     */
    async setDDEFacts() {
      try {
        const localAndRemoteDiffs = (await this.ddeInstance.getLocalAndRemoteDiffs()).diff
        this.facts.dde.localDiffs = this.ddeInstance
          .formatDiffValuesByType(localAndRemoteDiffs, 'local')
        this.facts.dde.shouldUpdateNpid = this.ddeInstance.shouldCreateNpid(localAndRemoteDiffs)
        this.facts.dde.hasDemographicConflict = !isEmpty(localAndRemoteDiffs)
        this.facts.dde.diffColumnsAndRows = this.ddeInstance.diffsToTurple(localAndRemoteDiffs)
      } catch (e) {
        console.warn(e)
      }
    },
    /**
     * The Application/Program determines which cards to
     * render on the view
     */
    async drawPatientCards() {
      if (!this.app.confirmationSummary) return

      const summaryEntries: Record<string, Function> 
        = await this.app.confirmationSummary(this.patient, this.program)

      for (const title in summaryEntries) {
        const data = await summaryEntries[title]()
        this.cards.push({ title, data })
      }
    },
    async presentLoading() {
      const loading = await loadingController
        .create({
          message: 'Please wait...',
          backdropDismiss: false
        })
      await loading.present()
    },
    /**
     * Executes CONFIRMATION_PAGE GUIDELINES with given TargetEvent
    */
    async onEvent(targetEvent: TargetEvent, callback={}) {
      const findings = matchToGuidelines(
        this.facts, CONFIRMATION_PAGE_GUIDELINES, '', targetEvent
      )
      for(const index in findings) {
        const finding = findings[index]
        if (finding?.actions?.alert) {
          const state = await finding?.actions?.alert(this.facts)
          if ((await this.runFlowState(state))
              === FlowState.FORCE_EXIT) {
              return false 
            }
        }
      }
      if (typeof callback === 'function') callback()
    },
    /**
     * Maps FlowStates defined in the Guideline to
     * Functions definitions that are executed.
     */
    async runFlowState(state: FlowState) {
      const states: Record<string, Function> = {
        'enroll': () => {
          return this.program.enrollProgram()
        },
        'activateFn': () => {
          this.$router.push(`/art/filing_numbers/${this.patient.getID()}?assign=true`)
          return FlowState.FORCE_EXIT
        },
        'updateDemographics': () => {
          this.$router.push(`/patient/registration?edit_person=${this.patient.getID()}`)
          return FlowState.FORCE_EXIT
        },
        'printNPID': async () => {
          loadingController.dismiss()
          await this.ddeInstance.printNpid()
        },
        'assignNpid': async () => {
          const req = await this.patient.assignNpid()
          if (req && (await alertConfirmation('Do you want to print National ID?'))) {
            const print = new PatientPrintoutService(this.patient.getID())
            await print.printNidLbl()
          }
        },
        'resolveDuplicateNpids': () => {
          this.$router.push(`/npid/duplicates/${this.facts.scannedNpid}`)
          return FlowState.FORCE_EXIT
        },
        'refreshDemographicsDDE': async () => {
          await this.ddeInstance.refreshDemographics()
        },
        'updateLocalDiffs': async () => {
          await this.ddeInstance.updateLocalDifferences(
            this.facts.dde.localDiffs
          )
        }
      }
      if (state in states) {
        try {
          return await states[state]()
        }catch(e) {
          toastDanger(e)
        }
      }
      return state
    },
    async onVoid() {
      voidWithReason(async (reason: string) => {
        await Patientservice.voidPatient(this.patient.getID(), reason)
        this.$router.push('/')
      })
    },
    async nextTask() {
      await this.onEvent(TargetEvent.ON_CONTINUE, () => {
        nextTask(this.patient.getID(), this.$router)
      })
    }
  }
})
</script>
<style scoped>
.card-content {
  height: 200px;
  overflow: hidden;
}
.tool-bar-medium-card {
  padding: 10px;
  width: 94.7%;
  margin: auto;
  font-size: 0.9em;
}
ul {
  padding: 0;
}
.li-item {
  list-style: none;
  font-size: 1.0em;
  margin: 0;
  padding: 0;
  line-height: 30px;
}
ion-card-header {
  padding: 0.3em;
  background: #3880ff;
  color: white!important;
}
ion-card-title {
  color: white;
}
ion-col p {
  margin: 0;
}
ion-card {
  height: 270px;
  padding: 0; 
  border-radius: 6px;
}
</style>