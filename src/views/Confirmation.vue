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
          v-if="facts.patientFound && isAdmin"
          color="danger left"
          size="large"
          @click="onVoid"
          >Void</ion-button
        >
        <ion-button 
          v-if="facts.patientFound"
          slot="end" 
          color="success" 
          size="large" 
          @click="nextTask">
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
import { alertConfirmation, toastDanger } from "@/utils/Alerts"
import { Patient } from "@/interfaces/patient"
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
  loadingController,
  modalController
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
import { IncompleteEntityError, BadRequestError } from "@/services/service"
import  { ART_GLOBAL_PROP } from "@/apps/ART/art_global_props"
import  { GLOBAL_PROP } from "@/apps/GLOBAL_APP/global_prop"

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
      patientFound: false as boolean,
      npidHasDuplicates: false as boolean,
      userRoles: [] as string[],
      scannedNpid: '' as string,
      currentNpid: '' as string,
      programName: 'N/A' as string,
      currentOutcome: '' as string,
      programs: [] as string[],
      identifiers: [] as string[],
      dde: {
        localNpidDiff: '',
        remoteNpidDiff: '',
        voidedNpids: {
         cols: [] as string[],
         rows: [] as any
        },
        hasDemographicConflict: false,
        localDiffs: {},
        diffRows: [],
        diffRowColors: [] as Array<{indexes: number[]; class: string}>
      } as any,
      demographics: {
        patientIsComplete: false as boolean,
        hasInvalidDemographics: false as boolean,
        invalidDemographics: [] as string[],
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
      } as any,
      globalProperties: {
        useFilingNumbers: `${ART_GLOBAL_PROP.FILING_NUMBERS}=true`,
        ddeEnabled: `${GLOBAL_PROP.DDE_ENABLED}=true`
      } as any
    }
  }),
  async created() {
    const app = HisApp.getActiveApp()
    if (app) this.app = app

    this.ddeInstance = new PatientDemographicsExchangeService()

    await this.ddeInstance.loadDDEStatus()

    this.useDDE = this.ddeInstance.isEnabled()
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
    }
  },
  methods: {
    /**
     * Resolve patient by either patient ID or NpID.
     * Note: 
     *  - DDE Service only supports NPID search.
    */
    async findAndSetPatient(id: number | undefined, npid: string | undefined) {
      await this.presentLoading()

      if (!this.facts.scannedNpid) this.facts.scannedNpid = npid || ''

      await this.resolveGlobalPropertyFacts()
      if (this.useDDE && npid) {
        await this.handleSearchResults(this.ddeInstance.searchNpid(npid))
      } else if (id) {
        // We need to maintain DDE workflow if an npid wasnt used to find the patient.
        // So find them locally first and then check with DDE if service is enabled
        if (this.useDDE) {
          const res = await Patientservice.findByID(id)
          if (res) {
            const p = new Patientservice(res)
            this.facts.scannedNpid = p.getNationalID()
            await this.handleSearchResults(this.ddeInstance.searchNpid(p.getNationalID()))
          }
        } else {
          await this.handleSearchResults(Patientservice.findByID(id))
        }
      } else {
        await this.handleSearchResults(Patientservice.findByNpid(npid as string))
      }
      await loadingController.dismiss()
      await this.onEvent(TargetEvent.ONLOAD)
    },
    /**
     * Handle search result promises and handle entity related errors.
     * This is also an entrypoint to initialise Ui Data and facts
     */
    async handleSearchResults(patient: Promise<Patient | Patient[]>) {
      let results: Patient[] | Patient = []
      try {
        results = await patient as Patient[] | Patient
      } catch (e) {
        // [DDE] A person might have missing attributes such as home_village, 
        // or home_ta.
        if (e instanceof IncompleteEntityError && !isEmpty(e.entity)) {
          results = e.entity
        }
        // DDE might send attribute validation errors for a person
        if (e instanceof BadRequestError && Array.isArray(e.errors)) {
          const [msg, ...entities] = e.errors
          if (typeof msg === 'string' && msg === "Invalid parameter(s)") {
            this.setInvalidParametersFacts(entities)
          }
        }
      }
      this.facts.patientFound = !isEmpty(results)
      if (this.facts.patientFound) {
        this.patient = new Patientservice(
          Array.isArray(results) 
            ? results[0]
            : results
          )
        this.setPatientFacts()
        await this.setProgramFacts()
        await this.drawPatientCards()
        this.facts.currentNpid = this.patient.getNationalID()
        this.facts.npidHasDuplicates = Array.isArray(results) && results.length > 1
      } else {
        // [DDE] a user might scan a deleted npid but might have a newer one.
        // The function below checks for newer version
        if (this.facts.scannedNpid) await this.setVoidedNpidFacts(this.facts.scannedNpid)
      }
    },
    /**
     * DDE sometimes sends 400 bad request which contains
     * a list of invalid demographic attributes 
     */
    setInvalidParametersFacts(errorExceptions: any) {
      this.facts.demographics.hasInvalidDemographics = true
      // Create a turple of attribute and error pairs
      this.facts.demographics.invalidDemographics =
        errorExceptions.map((e: any) => {
          const data = Object.entries(e)
          const entity = data[0][0]
          const errors = data[0][1] as string[]
          return [entity, errors.join(', ')]
        })      
    },
    /**
     * Reloads patient facts and information.
     * Note: Use this when you know the patient is loaded
     */
    reloadPatient() {
      return this.findAndSetPatient(this.patient.getID(), undefined)
    },
    /**
     * Facts are used by the Guideline Engine to crosscheck 
     * conditions to execute. The more the data the better
     * the decision support. These facts are also presented 
     * on the User interface
    */
    setPatientFacts() {
      this.facts.demographics.patientIsComplete = this.patient.patientIsComplete()
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
      this.facts.demographics.currentVillage = this.patient.getCurrentVillage()
      this.facts.identifiers = this.patient.getIdentifiers()
        .map((id: any) => id.type.name)
    },
    buildDDEDiffs(diffs: any) {
      const comparisons: Array<string[]> = []
      const refs: any = {
        givenName : { label: 'First Name', ref: 'given_name' },
        familyName: { label: 'Last Name', ref: 'family_name'},
        birthdate: { label: 'Birthdate', ref: 'birthdate'},
        gender: { label: 'Gender', ref: 'gender' },
        phoneNumber: {label: 'Phone number', ref: 'phone_number'},
        ancestryDistrict: { label: 'Home District', ref: 'home_district'},
        ancestryTA: { label: 'Home TA', ref: 'home_traditional_authority'},
        ancestryVillage: { label: 'Home Village', ref: 'home_village'},
        currentDistrict: { label: 'Current District', ref: 'current_district'},
        currentTA: { label: 'Current TA', ref: 'current_traditional_authority'},
        currentVillage: { label: 'Current Village', ref: 'current_village'}
      }
      let index = 0
      const diffIndexes: any = { indexes: [], class: 'his-empty-set-color'}

      for(const k in refs) {
        let local = this.facts.demographics[k]
        let remote = local

        if (refs[k].ref in diffs) {
          diffIndexes.indexes.push(index)
          local = diffs[refs[k].ref].local
          remote = diffs[refs[k].ref].remote
        }

        comparisons.push([
          refs[k].label,
          local,
          remote
        ])
        ++index
      }
      return {comparisons, rowColors: [diffIndexes]}
    },
    async resolveGlobalPropertyFacts() {
      for(const i in this.facts.globalProperties) {
        if (typeof this.facts.globalProperties[i] === 'string') {
          this.facts.globalProperties[i] = await GlobalPropertyService.isProp(
            this.facts.globalProperties[i]
          )
        }
      }
    },
    async setProgramFacts() {
      this.program = new PatientProgramService(this.patient.getID())
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
        const localAndRemoteDiffs = (await this.ddeInstance.getLocalAndRemoteDiffs())?.diff
        this.facts.dde.localDiffs = this.ddeInstance.formatDiffValuesByType(
          localAndRemoteDiffs, 'local'
        )
        this.facts.dde.hasDemographicConflict = !isEmpty(localAndRemoteDiffs)
        const { comparisons, rowColors } = this.buildDDEDiffs(localAndRemoteDiffs)
        this.facts.dde.diffRows = comparisons
        this.facts.dde.diffRowColors = rowColors
        if (localAndRemoteDiffs.npid) {
          const {local, remote} = localAndRemoteDiffs.npid
          this.facts.dde.localNpidDiff = local
          this.facts.dde.remoteNpidDiff = remote
        }
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
      this.cards = []
      const summaryEntries: Record<string, Function> 
        = await this.app.confirmationSummary(this.patient, this.program)

      for (const title in summaryEntries) {
        const data = await summaryEntries[title]()
        this.cards.push({ title, data })
      }
    },
    async setVoidedNpidFacts(npid: string) {
      const cols = [
        'Name', 'Birthdate', 'Gender', 'Ancestry Home', 'CurrentID', 'Action'
      ]
      let rows = []
      const req = await this.ddeInstance.findVoidedIdentifier(npid)
      if (req) {
        rows = req.map((d: any) => {
          const p = new Patientservice(d)
          return [
            p.getFullName(),
            p.getBirthdate(),
            p.getGender(),
            p.getHomeTA(),
            p.getNationalID(),
            {
              type: 'button',
              name: 'Select',
              action: async () => {
                await modalController.dismiss({ action: FlowState.FORCE_EXIT})
                await this.findAndSetPatient(undefined, p.getNationalID())
              }
            }
          ]
        })
        this.facts.dde.voidedNpids.cols = cols
        this.facts.dde.voidedNpids.rows = rows
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
        'gotoHome': () => {
          this.$router.push('/')
          return FlowState.FORCE_EXIT
        },
        'goBack': () => {
          this.$router.back()
          return FlowState.FORCE_EXIT
        },
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
        'createNpiDWithRemote': async () => {
          const npid = this.facts.dde.remoteNpidDiff
          if (npid && (await this.ddeInstance.createNPID(npid))) {
            this.facts.scannedNpid = npid
            this.facts.currentNpid = npid
            this.facts.dde.localNpidDiff = npid
            await this.findAndSetPatient(undefined, npid)
            return FlowState.FORCE_EXIT
          }
        },
        'assignNpid': async () => {
          const req =  await this.patient.assignNpid()

          if (req && (await alertConfirmation('Do you want to print National ID?'))) {
            const print = new PatientPrintoutService(this.patient.getID())
            await print.printNidLbl()
            await this.reloadPatient()
            return FlowState.FORCE_EXIT
          }
        },
        'resolveDuplicateNpids': () => {
          this.$router.push(`/npid/duplicates/${this.facts.scannedNpid}`)
          return FlowState.FORCE_EXIT
        },
        'refreshDemographicsDDE': async () => {
          await this.ddeInstance.refreshDemographics()
          await this.reloadPatient()
          return FlowState.FORCE_EXIT
        },
        'updateLocalDiffs': async () => {
          await this.ddeInstance.updateLocalDifferences(
            this.facts.dde.localDiffs
          )
          await this.reloadPatient()
          return FlowState.FORCE_EXIT
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