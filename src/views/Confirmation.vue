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
import HisApp from "@/apps/app_lib"
import { defineComponent } from "vue";
import { Patientservice } from "@/services/patient_service";
import { UserService } from "@/services/user_service";
import { alertAction, alertConfirmation, toastDanger, toastSuccess } from "@/utils/Alerts"
import { WorkflowService } from "@/services/workflow_service"
import HisDate from "@/utils/Date"
import { PatientProgramService } from "@/services/patient_program_service"
import { voidWithReason } from "@/utils/VoidHelper"
import { isEmpty } from "lodash";
import { matchToGuidelines } from "@/utils/GuidelineEngine"
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
    facts: {
      programName: 'N/A' as string,
      currentOutcome: '' as string,
      viralLoadStatus: '' as 'High' | 'Low' | '',
      programs: [] as string[],
      identifiers: [] as string[],
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
        useFilingNumbers: 'use_filing_numbers=true'
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
    '$route': {
      async handler({query}: any) {
        if (!isEmpty(query) && (
          query.person_id 
          || query.patient_barcode)) 
          {
          await this.setPatient(
            query.person_id, 
            query.patient_barcode
          )
        }
      },
      immediate: true
    },
    async patient() {
      await this.presentLoading()
      await this.setProgram()
      this.setPatientFacts()
      await this.setProgramFacts()
      await this.resolveGlobalPropertyFacts()
      await this.drawPatientCards()
      loadingController.dismiss()
      await this.onEvent(TargetEvent.ONLOAD)
    }
  },
  methods: {
    setProgram() {
      this.program = new PatientProgramService(this.patient.getID())
    },
    /**
     * Resolve patient by either patient ID or NpID 
     * depending on search criteria
     */
    async setPatient(id: any, npid: any) {
      let data: any = {}
      await this.presentLoading()

      if (id) {
        data = await Patientservice.findByID(id)
      } else if (npid) {
        data = await Patientservice.findByNpid(npid)
      }

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
      this.facts.identifiers = this.getStrIdentifierTypes()
    },
    async resolveGlobalPropertyFacts() {
      for(const i in this.facts.globalProperties) {
        const [prop, val] = this.facts.globalProperties[i].split('=')
        const configuredVal = await GlobalPropertyService.get(prop)
        if (configuredVal != undefined) {
          this.facts.globalProperties[i] = val === configuredVal
        }
      }
    },
    async setProgramFacts() {
      const { program, outcome }: any =  await this.program.getProgram()
      this.facts.currentOutcome = outcome
      this.facts.programName = program
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
     * Checks Confirmation page guidelines for patient observations
    */
    async onEvent(targetEvent: TargetEvent) {
      const findings = matchToGuidelines(
        this.facts,
        CONFIRMATION_PAGE_GUIDELINES, 
        '', 
        targetEvent
      )
      for(const index in findings) {
          const finding = findings[index]
          if (finding?.actions?.alert) {
            const state = await finding?.actions?.alert(this.facts)
            switch(state) {
              case FlowState.EXIT:
                continue
              case FlowState.FORCE_EXIT:
                return false
              default:
                await this.runFlowState(state)
            }
          }
      }
      return true
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
          return this.$router.push(`/art/filing_numbers/${this.patient.getID()}?assign=true`)
        },
        'updateDemographics': () => {
          return this.$router.push(`/patient/registration?edit_person=${this.patient.getID()}`)
        },
        'assignNpid': async () => {
          const req = await this.patient.assignNpid()
          loadingController.dismiss()
          if (req) {
            const ok = await alertConfirmation('Do you want to print National ID?')
            if (ok) {
              const print = new PatientPrintoutService(this.patient.getID())
              await print.printNidLbl()
            }
          }
        }
      }
      if (state in states) {
        await this.presentLoading()
        try {
          await states[state]()  
          toastSuccess('Operation successful')
        }catch(e) {
          toastDanger(e)
        }
        loadingController.dismiss()
      }
    },
    async onVoid() {
      voidWithReason(async (reason: string) => {
        await Patientservice.voidPatient(this.patient.getID(), reason)
        this.$router.push('/')
      })
    },
    getStrIdentifierTypes() {
      return this.patient.getIdentifiers().map((id: any) => id.type.name)
    },
    async nextTask() {
      const ok: any = await this.onEvent(TargetEvent.ON_CONTINUE)
      if (!ok) {
        return
      }      
      const params = await WorkflowService.getNextTaskParams(this.patient.getID())
      if(params.name) {
        this.$router.push(params)
      }else {
        this.$router.push(`/patient/dashboard/${this.patient.getID()}`)
      }
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