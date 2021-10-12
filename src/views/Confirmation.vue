<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-row> 
          <ion-col> 
            <div class="tool-bar-medium-card"> 
              Patient Name: <b> {{facts.patientName}}</b> <p/>
              Birthdate: <b> {{birthdate}} </b> <p/>
              Gender:  <b>{{facts.gender}} </b>
            </div>
          </ion-col>
          <ion-col> 
            <div class="tool-bar-medium-card"> 
              Ancestry district: <b>{{ facts.ancestryDistrict }}</b> <p/>
              Ancestry TA: <b>{{ facts.ancestryTA }}</b> <p/>
              Ancestry village: <b>{{ facts.ancestryVillage }}</b> <p/>
            </div>
          </ion-col>
          <ion-col> 
            <div class="tool-bar-medium-card"> 
              Current District: <b> {{ facts.currentDistrict }}</b><p/>
              Current TA: <b> {{ facts.currentTA }}</b><p/>
              Current Village: <b> {{ facts.currentVillage }}</b><p/>
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
interface DataInterface {
  label: string;
  value: string;
}
import { defineComponent } from "vue";
import { Observation } from "@/interfaces/observation";
import { ObservationService } from "@/services/observation_service";
import { Patientservice } from "@/services/patient_service";
import { ProgramService } from "@/services/program_service";
import { OrderService } from "@/services/order_service";
import { UserService } from "@/services/user_service";
import { RelationshipService } from "@/services/relationship_service";
import { ConceptService } from "@/services/concept_service"
import { alertAction } from "@/utils/Alerts"
import { WorkflowService } from "@/services/workflow_service"
import PatientAlerts from "@/services/patient_alerts"
import HisDate from "@/utils/Date"
import { PatientProgramService } from "@/services/patient_program_service"
import { voidWithReason } from "@/utils/VoidHelper"
import { isEmpty } from "lodash";
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
    program: {} as any,
    patient: {} as any,
    cards: [] as any[],
    facts: {
      programName: '' as string,
      currentOutcome: '' as string,
      viralLoadStatus: '' as 'High' | 'Low' | '',
      programs: [] as string[],
      identifiers: [] as string[],
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
      npID: '' as string
    }
  }),
  computed: {
    birthdate(): string {
      return HisDate.toStandardHisDisplayFormat(
        this.facts.birthdate
      )
    },
    isAdmin() {
      return UserService.isAdmin()
    }
  },
  watch: {
    '$route': {
      async handler({query}: any) {
        if (query) {
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
      this.setProgramFacts()
      await this.drawPatientCards()
      loadingController.dismiss()
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
    setPatientFacts() {
      this.facts.patientName = this.patient.getFullName()
      this.facts.givenName = this.patient.getGivenName()
      this.facts.familyName = this.patient.getFamilyName()
      this.facts.landmark = this.patient.getAttribute(19)
      this.facts.phoneNumber = this.patient.getAttribute(12)
      this.facts.gender = this.patient.getGender()
      this.facts.birthdate = this.patient.getBirthdate()
      this.facts.ancestryDistrict = this.patient.getHomeDistrict()
      this.facts.ancestryTA = this.patient.getHomeTA()
      this.facts.ancestryVillage = this.patient.getHomeVillage()
      this.facts.currentDistrict = this.patient.getCurrentDistrict()
      this.facts.currentTA = this.patient.getCurrentTA()
      this.facts.currentVillage = this.patient.getHomeVillage()
      this.facts.npID = this.patient.getNationalID()
    },
    async setProgramFacts() {
      const { program, outcome }: any =  await this.program.getProgram()
      this.facts.currentOutcome = outcome
      this.facts.programName = program
    },
    drawPatientCards() {
      return this.getProgramInfoCard()
        .then(this.getAlertCard)
        .then(this.getLabOrdersCard)
        .then(this.getIdentifiersCard)
        .then(this.getOucomeCard)
        .then(this.getGuardianCard)
    },
    async presentLoading() {
      const loading = await loadingController
        .create({
          message: 'Please wait...',
          backdropDismiss: false
        })
      await loading.present()
    },
    async onVoid() {
      voidWithReason(async (reason: string) => {
        await Patientservice.voidPatient(this.patient.getID(), reason)
        this.$router.push('/')        
      })
    },
    async nextTask() {
      const params = await WorkflowService.getNextTaskParams(this.patient.getID())
      if(params.name) {
        this.$router.push(params)
      }else {
        this.$router.push(`/patient/dashboard/${this.patient.getID()}`)
      }
    },
    getGuardianCard() {
      RelationshipService.getGuardianDetails(
        this.patient.getID()
      ).then((relationship: any) => {
        const rel: DataInterface[] = relationship.map((r: any) => {
          return {
            label: r.name,
            value: r.relationshipType,
          };
        });
        const displayData = {
          title: "GUARDIAN(s)",
          data: { ...rel },
        };
        this.cards.push(displayData);
      });
    },
    getOucomeCard() {
      const displayData = {
        title: "Outcome",
        data: [
          {
            label: "Current Outcome",
            value: this.facts.currentOutcome,
          },
        ] as DataInterface[],
      };
      this.cards.push(displayData);
    },
    async getLabOrdersCard() {
      const displayData = {
        title: "Labs",
        data: [] as DataInterface[],
      };
      await OrderService.getOrders(this.patient.getID()).then((orders) => {
        const VLOrders = OrderService.getViralLoadOrders(orders);
        VLOrders.forEach((element) => {
          displayData.data.push({
            value: OrderService.formatOrders(element),
            label: ``,
          });
        });
      });
      this.cards.push(displayData);
    },
    async getAlertCard() {
      const sideEffects: Observation[] = await PatientAlerts.alertSideEffects(this.patient.getID())
      const displayData = {
        title: "ALERTS",
        data: [
          {
            label: "Side effects",
            value: sideEffects.length,
          },
        ],
      };
      this.cards.push(displayData);
    },
    getIdentifiersCard() {
      this.cards.push({
        title: "PATIENT IDENTIFIERS",
        data: [
          {
            label: "ARV Number",
            value: this.patient.getArvNumber(),
          },
          {
            label: "NPID",
            value: this.patient.getNationalID(),
          },
        ],
      });
    },
    async getProgramInfoCard() {
      const patientID = this.patient.getID()
      const displayData = {
        title: "PROGRAM INFORMATION",
        data: [] as DataInterface[],
      };
      const params = await WorkflowService.getNextTaskParams(patientID)
      let task = 'NONE'      
      if(params.name) {
        task = params.name
      }
      displayData.data.push({
        label: "Next Task",
        value: `${task}`,
      });
      await ProgramService.getProgramInformation(patientID)
        .then(
        (task) => {
          displayData.data.push({
            label: "ART Duration",
            value: `${task.art_duration} month(s) `,
          });
        }
      );
      await ProgramService.getFastTrackStatus(patientID).then(
        (task) => {
          const data = task["Continue FT"] === true ? "Yes" : "No";
          displayData.data.push({
            label: "On Fast Track",
            value: data,
          });
        }
      );
      const appointMentObs: Observation[] = await ObservationService.getObservations(
        patientID,
        ConceptService.getCachedConceptID('appointment date')
      );
      if (appointMentObs.length > 0) {
        const nextAPPT = HisDate.toStandardHisDisplayFormat(appointMentObs[0].value_datetime);
        displayData.data.push({
          label: "Next Appointment",
          value: nextAPPT,
        });
      }
      this.cards.push(displayData);
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