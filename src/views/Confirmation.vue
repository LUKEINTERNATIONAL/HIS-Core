<template>
  <ion-page>
  <ion-loading
    :is-open="isOpenRef"
    cssClass="my-custom-class"
    message="Please wait..."
  >
  </ion-loading>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-row> 
          <ion-col> 
            <div class="tool-bar-medium-card"> 
              <b> Patient Name:</b> {{patientName}} <p/>
              <b> Birthdate: </b> {{birthdate}} <p/>
              <b> Gender: </b> {{gender}}
            </div>
          </ion-col>
          <ion-col> 
            <div class="tool-bar-medium-card"> 
              <b>Ancestry district:</b> {{ ancestryDistrict }}<p/>
              <b>Ancestry TA:</b> {{ ancestryTA }}<p/>
              <b>Ancestry village:</b> {{ ancestryVillage }}<p/>
            </div>
          </ion-col>
          <ion-col> 
            <div class="tool-bar-medium-card"> 
              <b>Current District:</b> {{ currentDistrict }}<p/>
              <b>Current TA:</b> {{ currentTA }}<p/>
              <b>Current Village:</b> {{ currentVillage }}<p/>
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
                  <strong v-if="info.label">{{ info.label }} &nbsp; </strong>
                  {{ info.value }}
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
  IonLoading,
} from "@ionic/vue";
import { defineComponent, ref } from "vue";
import { barcode, man, woman } from "ionicons/icons";
import ApiClient from "@/services/api_client";
import { Patient } from "@/interfaces/patient";
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
import { PatientPrintoutService } from "@/services/patient_printout_service";
import { voidWithReason } from "@/utils/VoidHelper"

export default defineComponent({
  name: "Home",
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonToolbar,
    IonRow,
    IonCol,
    IonButton,
    IonFooter,
    IonCard,
    IonCardContent,
    IonCardTitle,
    IonCardHeader, 
    IonLoading
  },
  data() {
    return {
      patientBarcode: "" as any,
      patientName: "",
      landmark: "",
      phoneNumber: "",
      currentDistrict: "",
      currentTA: "",
      currentVillage: "",
      ancestryDistrict: "",
      ancestryTA: "",
      ancestryVillage: "",
      gender: "",
      birthdate: "",
      cards: [] as any,
      ARVNumber: "",
      NPID: "",
      patientID: "" as any
    };
  },
  methods: {
    async onVoid() {
      voidWithReason(async (reason: string) => {
        await Patientservice.voidPatient(this.patientID, reason)
        this.$router.push('/')        
      })
    },
    async nextTask() {
      const params = await WorkflowService.getNextTaskParams(this.patientID)
      if(params.name) {
        this.$router.push(params)
      }else {
        this.$router.push(`/patient/dashboard/${this.patientID}`)
      }
    },
    alertPatientNotFound() {
      alertAction('Patient not found', [
        {
          text: 'Home',
          handler: () => this.$router.push('/')
        },
        {
          text: 'Back',
          handler: () => this.$router.back()
        }
      ])
    },
    fetchPatient: async function () {
      const response = await ApiClient.get(`/patients/${this.patientID}`);

      this.setOpen(true);
      if (!response || response.status !== 200) {
        this.setOpen(false);
        this.alertPatientNotFound();

      } // NOTE: Targeting Firefox 65, can't `response?.status`
      else {
        const data: Patient = await response.json();
        this.parsePatient(data);
      }
    },
    fetchPatientByID: async function() {
      this.setOpen(true);
      const response = await ApiClient.get(`/search/patients/by_npid?npid=${this.patientBarcode}`);

      if (!response || response.status !== 200) {
        this.setOpen(false);
        this.alertPatientNotFound();
      } 
      else {
        const data: Patient[] = await response.json();

        switch (data.length) {
          case 0:
            this.alertPatientNotFound();
            this.setOpen(false);
            break;
          case 1:
            this.patientID = data[0].patient_id; 
            this.parsePatient(data[0]);
            break;
          default:
            console.log('duplicates');
            break;
        }
      }
    },
    parsePatient: async function(data: Patient) {
        this.cards = [];
        const patient = new Patientservice(data);
        this.patientName = patient.getFullName();
        this.landmark = patient.getAttribute(19);
        this.phoneNumber = patient.getAttribute(12);
        const addresses = patient.getAddresses();
        this.gender = data.person.gender;
        this.birthdate = HisDate.toStandardHisDisplayFormat(data.person.birthdate);
        this.ancestryDistrict = addresses.ancestryDistrict;
        this.ancestryTA = addresses.ancestryTA;
        this.ancestryVillage = addresses.ancestryVillage;
        this.currentDistrict = addresses.currentDistrict;
        this.currentTA = addresses.currentTA;
        this.currentVillage = addresses.ancestryVillage;
        this.ARVNumber = patient.getPatientIdentifier(4);
        const ARVNumber = patient.getPatientIdentifier(4);
        const NPID = await this.getNPID(patient);
        this.cards.push({
          title: "PATIENT IDENTIFIERS",
          data: [
            {
              label: "ARV Number",
              value: ARVNumber,
            },
            {
              label: "NPID",
              value: NPID,
            },
          ],
        });
        
        await this.fetchAlerts()
          .then(this.fetchLabOrders)
          .then(this.fetchProgramInfo)
          .then(this.fetchGuardians)

          this.setOpen(false);
    },
    async getNPID(patient: any) {
      this.setOpen(false)
      const NPID = patient.getPatientIdentifier(3)
      if(NPID ==="") {
          const f = await this.assignNHID(patient.getID());
          this.printNHID();
          return f.new_identifier.identifier;
        }
      this.setOpen(true)
      return NPID;
    },
    async assignNHID(patientID: number) {
      await alertAction("Patient was found BUT has no National ID.<br />The system is going to assign the patient with a new ID", [
        {
          text: "OK",
          handler: async () => {
            null
          },
        },
      ]);
      return await Patientservice.assignNHID(patientID);
    },
    async printNHID() {
     const p = new PatientPrintoutService(this.patientID);
     await p.printNidLbl()
  },
    fetchAlerts: async function () {
      const sideEffects: Observation[] = await PatientAlerts.alertSideEffects(this.patientID)
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
    fetchLabOrders: async function () {
      const displayData = {
        title: "Labs",
        data: [] as DataInterface[],
      };
      await OrderService.getOrders(this.patientID).then((orders) => {
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
    fetchProgramInfo: async function () {
      const displayData = {
        title: "PROGRAM INFORMATION",
        data: [] as DataInterface[],
      };
      let outcome = "";

      const params = await WorkflowService.getNextTaskParams(this.patientID)
      let task = 'NONE'      
      if(params.name) {
        task = params.name
      }
      displayData.data.push({
            label: "Next Task",
            value: `${task}`,
      });
      await ProgramService.getProgramInformation(this.patientID).then(
        (task) => {
          displayData.data.push({
            label: "ART Duration",
            value: `${task.art_duration} month(s) `,
          });
          outcome = task.current_outcome;
        }
      );
      await ProgramService.getFastTrackStatus(this.patientID).then(
        (task) => {
          const data = task["Continue FT"] === true ? "Yes" : "No";
          displayData.data.push({
            label: "On Fast Track",
            value: data,
          });
        }
      );
      const appointMentObs: Observation[] = await ObservationService.getObservations(
        this.patientID,
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
      this.fetchOutCome(outcome);
    },
    fetchOutCome: async function (outcome: string) {
      const displayData = {
        title: "Outcome",
        data: [
          {
            label: "Current Outcome",
            value: outcome,
          },
        ] as DataInterface[],
      };
      this.cards.push(displayData);
    },
    fetchGuardians: async function () {
      RelationshipService.getGuardianDetails(
        this.patientID
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
    setupconfirmation(query: any) {
      this.resetState();
      if(query.person_id) {
        const patientID = query.person_id as any;
        this.patientID = parseInt(patientID);
        this.fetchPatient();
      }else if(query.patient_barcode) {
        const patientBarcode = query.patient_barcode as any;
        this.patientBarcode = patientBarcode.replace(/-/g, "");
        this.fetchPatientByID();
      }
    },
    resetState() {
       this.patientBarcode = "";
        this.patientName =  "";
        this.landmark = "";
        this.phoneNumber = "";
        this.currentDistrict = "";
        this.currentTA = "";
        this.currentVillage = "";
        this.ancestryDistrict = "";
        this.ancestryTA = "";
        this.ancestryVillage = "";
        this.gender = "";
        this.birthdate = "";
        this.cards =  [];
        this.ARVNumber = "";
        this.NPID = "";
        this.patientID =  "";
    }
     
  },
  setup() {
    const isOpenRef = ref(true);
    const setOpen = (state: boolean) => isOpenRef.value = state;

    return { isOpenRef, setOpen,
      barcode,
      man,
      woman,
    };
  },
   watch: {
    $route: {
      async handler({ query }: any) {
       this.setupconfirmation(query);
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    isAdmin() {
      return UserService.isAdmin;
    },
  },
});
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