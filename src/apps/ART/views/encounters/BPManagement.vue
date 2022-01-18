<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title> 
          <span>BP management screening on {{ date }}</span>
          <span v-if="patientOnBPDrugs" style="color: green">
            Patient already on BP drugs</span>
        </ion-title>
        <span slot="end">
          <ion-button
            color="danger"
            @click="showRiskFactors"
            v-if="totalRiskFactors > 0"
            >View/Edit risk factors {{ totalRiskFactors }}</ion-button
          >
          <ion-button @click="showRiskFactors" v-if="totalRiskFactors === 0"
            >add riskfactors</ion-button
          >
        </span>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <view-port>
        <div class="view-port-content">
          <ion-header> </ion-header>
          <ion-content>
            <div style="height: 100%;">
              <ion-grid style="height: 100%;">
                <ion-row style="max-height: 80%; overflow: scroll; ">
                  <data-table :config="{showIndex: false}" :columns="columns" :rows="rows"></data-table>
                </ion-row>
              </ion-grid>
            </div>
          </ion-content>
        </div>
      </view-port>
      <div class="his-floating-keyboard"> 
        <ion-radio-group v-model="action">
          <ion-grid>
            <ion-row>
              <ion-col
                size="4"
                v-for="(item, index) in items"
                :key="index"
              >
                <ion-item>
                  <ion-label>{{ item.label }}</ion-label>
                  <ion-radio :value="item"></ion-radio>
                </ion-item>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-radio-group>
      </div>
    </ion-content>
    <ion-footer>
      <ion-toolbar color="dark">
        <ion-button
          size="large"
          color="danger"
          slot="start"
          @click="gotoPatientDashboard"
        >
          cancel
        </ion-button>
        <ion-button
          size="large"
          color="danger"
          slot="start"
          v-if="showClinicianButton"
          @click="referPatient"
        >
          Refer to clinician
        </ion-button>
        <ion-button
          size="large"
          slot="end"
          @click="goToDiagnosis"
          v-if="!patientHasHyperTensionObs"
        >
          Hypertension Diagnosis
        </ion-button>

        <ion-button 
          size="large" 
          color="success" 
          slot="end" 
          @click="onFinish">
          Finish
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import ViewPort from "@/components/DataViews/ViewPort.vue";
import {
  IonToolbar,
  IonTitle,
  IonHeader,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonRadioGroup,
  IonRadio,
  IonButton,
  modalController,
  IonFooter,
  IonPage,
  IonItem,
  IonLabel,
} from "@ionic/vue";
import { toastWarning, alertAction } from "@/utils/Alerts";
import EncounterMixinVue from "./EncounterMixin.vue";
import RiskFactorModal from "@/components/DataViews/RiskFactorModal.vue";
import { ObservationService } from "@/services/observation_service";
import { ConceptService } from "@/services/concept_service";
import { Service } from "@/services/service";
import HisDate from "@/utils/Date";
import { isEmpty } from "lodash";
import { BPManagementService } from "../../services/htn_service";
import { UserService } from "@/services/user_service";
import { ProgramService } from "@/services/program_service";
import { VitalsService } from "@/apps/ART/services/vitals_service"
import { toastDanger } from "@/utils/Alerts";
import { PatientProgramService } from "@/services/patient_program_service";
import DataTable from "@/components/DataViews/tables/ReportDataTable.vue"
import table from "@/components/DataViews/tables/ReportDataTable"

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: {
    DataTable,
    ViewPort,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonContent,
    IonGrid,
    IonRow,
    IonButton,
    IonRadioGroup,
    IonRadio,
    IonCol,
    IonFooter,
    IonPage,
    IonItem,
    IonLabel,
  },
  data: () => ({
    htn: {} as any,
    hasARVNumber: true,
    suggestedNumber: "" as any,
    columns: [
      [
        table.thTxt("Date"),
        table.thTxt("Systolic"),
        table.thTxt("Diastolic"),
        table.thTxt("BP Drugs"),
        table.thTxt("Action / Note")
      ]
    ] as any,
    rows: [] as any,
    rowColors: [] as Array<any>,
    cellColors: [] as Array<any>,
    styles: [] as Array<string>,
    riskFactors: [] as any,
    action: null as any,
    trail: [] as any,
    date: null as any,
    patientOnBPDrugs: false,
    patientFirstVisit: false,
    normatensive: false,
    patientHasHyperTensionObs: false,
    currentDrugs: [],
    items: [] as any,
    isEnrolledInHTN: false,
    isAliveOnHTN: false,
    HTNProgramID: 20,
    aliveState: 160,
    refer: false,
  }),
  watch: {
    patient: {
      async handler(patient: any) {
        this.htn = new BPManagementService(this.patientID, this.providerID);
        this.riskFactors = await this.getRiskFactors();
        this.rows = await this.formatTrail();
        this.date = HisDate.toStandardHisDisplayFormat(
          Service.getSessionDate()
        );
        await this.isTransfered();
        await this.hasHyperTenstion();
        await this.getTreatmentStatus();
        await this.getProgramStatus();
        this.getItems();
      },
      deep: true,
    },
  },
  computed: {
    totalRiskFactors(): any {
      return this.riskFactors.filter((d: any) => d.value === "Yes").length;
    },
    showClinicianButton() {
      return !UserService.isClinician() && !UserService.isDoctor();
    },
  },
  methods: {
    async onFinish() {
      if (this.action || this.refer) {
        const encounter = await this.htn.createEncounter();
        if (!encounter) return toastWarning("Unable to create encounter");
        if (this.refer) {
          const obs = await this.htn.saveValueCodedObs(
            "Refer patient to clinician",
            "Yes"
          );
          if (!obs) return toastWarning("Unable to create Obs");
          this.gotoPatientDashboard();
        } else {
          const obs = await this.htn.saveValueTextObs(
            "Plan",
            this.action.label
          );

          if (!obs) return toastWarning("Unable to create Obs");
          const patientState = {
            state: this.action.value,
          };
          await this.htn.enrollPatient(patientState);
          this.nextAction(this.action.label);
        }
      } else {
        toastWarning("Please select an action");
      }
    },
    referPatient() {
      this.refer = true;
      this.onFinish();
    },
    goToDiagnosis() {
      return this.$router.push({
        path: `/art/encounters/hypertension_diagnosis/${this.patientID}`,
      });
    },
    nextAction(state: string) {
      switch (state) {
        case "Start anti hypertensives":
          this.$router.push(
            `/art/encounters/bp_prescription/${this.patientID}`
          );
          break;
        case "Review Drugs":
          this.$router.push(
            `/art/encounters/bp_adherence/${this.patientID}?review=true`
          );
          break;
        case "Continue Drugs":
          this.$router.push(`/art/encounters/bp_adherence/${this.patientID}`);
          break;
        case "Did not take prescribed BP drugs today":
          this.$router.push(`/art/encounters/bp_adherence/${this.patientID}`);
          break;
        default:
          this.nextTask();
          break;
      }
    },

    async hasHyperTenstion() {
      const ob = await ObservationService.getFirstValueCoded(
        this.patientID,
        "Patient has hypertension"
      );
      this.patientHasHyperTensionObs = ob === "Yes";
    },
    async isTransfered() {
      const ob = await ObservationService.getFirstValueCoded(
        this.patientID,
        "Transferred"
      );
      this.patientFirstVisit = ob !== "Yes";
    },
    async getTreatmentStatus() {
      const ob = await ObservationService.getFirstValueText(
        this.patientID,
        "Treatment status"
      );
      this.patientOnBPDrugs = ob && ob.match(/BP Drugs started/i);
    },
    async getProgramStatus() {
      const programs: any[] = await ProgramService.getPatientPrograms(
        this.patientID
      );
      this.isEnrolledInHTN =
        programs.filter(
          (program) => program.program.name === "HYPERTENSION PROGRAM"
        ).length > 0;
      if (this.isEnrolledInHTN) {
        await this.programState();
      }
    },
    async programState() {
      const programs: any[] = await ProgramService.getPatientStates(
        this.patientID,
        this.HTNProgramID
      );
      this.isAliveOnHTN =
        programs.filter((program) => program.name === "Alive").length > 0;
    },
    async getRiskFactors() {
      const concepts = ConceptService.getConceptsByCategory("risk factors");
      const j = concepts.map(async (concept) => {
        const val = await ObservationService.getFirstValueCoded(
          this.patientID,
          concept.name
        );
        return {
          concept: concept.name,
          value: val,
        };
      });
      return Promise.all(j);
    },
    async formatTrail() {
      const colorMap: any = {
        'N/A': '#ffffff',
        'normal': '#2dd36f',
        'grade 1': '#ffedbf',
        'grade 2': '#ffad5a',
        'grade 3': '#ffac8d'
      }

      const trail = await this.htn.getBPTrail();

      return Object.keys(trail).map(m => {
        const date = HisDate.toStandardHisDisplayFormat(m);
        this.currentDrugs = trail[m]["drugs"];
        const colorGrade = () => {
          const grade: string = BPManagementService.getBpGrade(
            parseInt(trail[m].sbp),
            parseInt(trail[m].dbp)
          )
          return colorMap[grade]
        }
        const style = {
          background: colorGrade()
        }
        return [
          table.tdDate(date, { style }),
          table.td(trail[m].sbp, { style }),
          table.td(trail[m].dbp, { style }),
          table.td(trail[m]["drugs"].join(", "), { style }),
          table.td(trail[m].notes, { style })
        ]
      })
    },

    async showRiskFactors() {
      const modal = await modalController.create({
        component: RiskFactorModal,
        backdropDismiss: false,
        cssClass: "large-modal",
        componentProps: {
          factors: this.riskFactors,
        },
      });
      modal.present();
      const { data } = await modal.onDidDismiss();
      if (!isEmpty(data)) {
        this.riskFactors = data.map((d: any) => {
          const val = d.isChecked === true ? "Yes" : "No";
          return {
            concept: d.concept,
            value: val,
          };
        });
      }
    },
    async enrollInHTN() {
      const program  = new PatientProgramService(this.patientID)
      program.setProgramId(this.HTNProgramID)
      program.setStateDate(ProgramService.getSessionDate())
      program.setStateId(this.aliveState)
      await program.enrollProgram()
      await program.updateState()
    },
    async setHtnTransferred(transferred: 'Yes' | 'No'){
      const vitals = new VitalsService(this.patientID, this.providerID)
      const encounter = await vitals.createEncounter()
      if (!encounter) {
        toastDanger('Unable to create patient transferr encounter')
      } else {
        const obs = await vitals.saveValueCodedObs('Transferred', transferred)
        if (!obs) {
          toastDanger('Unable to create observation Transferred for patient')
        }
      }
    },
    async getItems() {
      if (this.patientOnBPDrugs && this.patientFirstVisit) {
        if (!this.isEnrolledInHTN) {
          alertAction("Do you want to enroll this client in the HTN program?", [
            {
              text: "Yes",
              handler: async () => {
                await this.enrollInHTN();
                await this.setHtnTransferred('Yes')
                this.patientFirstVisit = false;
                await this.getItems();
              },
            },
            {
              text: "No",
              handler: async () => {
                await this.setHtnTransferred('No')
                this.nextTask()
              },
            },
          ]);
        } else {
          this.patientFirstVisit = false;
          await this.getItems();
        }
      } else {
        if (this.currentDrugs.length > 0) {
          this.items = [
            {
              label: "Did not take prescribed drugs",
              value: "on treatment",
            },
            {
              label: "Continue drugs",
              value: "on treatment",
            },
            {
              label: "Review drugs",
              value: "on treatment",
            },
          ];
        } else {
          this.items = [
            {
              label: "Lifestyle advice given",
              value: "Lifestyle changes only",
            },
            {
              label: "Not yet stable on ART",
              value: "Symptomatic but not in treatment",
            },
            {
              label: "Patient declining BP drugs ",
              value: "Symptomatic but not in treatment",
            },
          ];
          if (this.normatensive) {
            this.items.push({
              label: "Return to annual screening",
              value: "Alive",
            });
          }
          this.items.push({
            label: "Start anti hypertensives",
            value: "On treatment",
          });
        }
      }
    },
  },
});
</script>