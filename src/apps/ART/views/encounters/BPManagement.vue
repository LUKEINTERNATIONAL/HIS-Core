<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title> 
          <span>BP management screening on {{ date }}</span>
          <small v-if="patientOnBPDrugs" style="color: green">
            (Patient already on BP drugs)</small>
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
      <data-table :config="{showIndex: false}" :columns="columns" :rows="rows"></data-table>
    </ion-content>
    <ion-footer>
      <ion-toolbar v-if="patientHasHyperTensionObs && isEnrolledInHTN"> 
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
      </ion-toolbar>
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
          slot="end"
          @click="enrollInHTN"
          v-if="patientHasHyperTensionObs && !isEnrolledInHTN"
          > 
          Enroll in HTN
        </ion-button>
        <ion-button 
          size="large"
          color="success" 
          slot="end"
          v-if="patientHasHyperTensionObs"
          @click="onFinish">
          Finish
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>
<script lang="ts">
import { defineComponent } from "vue";
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
import { toastWarning, alertAction, toastSuccess } from "@/utils/Alerts";
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

const HEADER_STYLE = {
  background: '#444444',
}
export default defineComponent({
  mixins: [EncounterMixinVue],
  components: {
    DataTable,
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
        table.thTxt("Date", { style: HEADER_STYLE }),
        table.thTxt("Systolic", { style: HEADER_STYLE }),
        table.thTxt("Diastolic", { style: HEADER_STYLE }),
        table.thTxt("BP Drugs", { style: HEADER_STYLE }),
        table.thTxt("Action / Note", { style: HEADER_STYLE })
      ]
    ] as any,
    bpGradeColorMap: {
      'N/A': '#ffffff',
      'normal': '#2dd36f',
      'grade 1': '#feede2',
      'grade 2': '#fef9df',
      'grade 3': '#fcd4d4'
    } as any,
    rows: [] as any,
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
    ready: {
      async handler(ready: boolean) {
        if (!ready) return
        this.htn = new BPManagementService(this.patientID, this.providerID);
        this.trail = await this.htn.getBPTrail();
        this.rows = this.formatBpTrailRows(this.trail);
        this.normatensive = BPManagementService.isBpNormotensive(this.trail)
        this.riskFactors = await this.getRiskFactors();
        this.date = HisDate.toStandardHisDisplayFormat(Service.getSessionDate());
        await this.isTransfered();
        await this.hasHyperTenstion();
        await this.getTreatmentStatus();
        await this.getProgramStatus();
        if (this.patientHasHyperTensionObs && !this.isEnrolledInHTN) {
          await this.alertHtnEnrollment()
        }
        this.getItems();
      },
      immediate: true,
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

          if (!obs) return toastWarning("Unable to create Obs")
          const patientState = {
            state: this.action.value,
          }
          
          await this.htn.enrollPatient(patientState);

          if (typeof this.action?.other?.action === 'function') {
            return this.action.other.action()
          } else {
            this.nextTask()
          }
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
      })
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
        }
      })
      return Promise.all(j);
    },
    formatBpTrailRows(trail: any) {
      return Object.keys(trail).map(m => {
        const date = HisDate.toStandardHisDisplayFormat(m);
        this.currentDrugs = trail[m]["drugs"];
        const colorGrade = () => {
          const grade: string = BPManagementService.getBpGrade(
            parseInt(trail[m].sbp),
            parseInt(trail[m].dbp)
          )
          return this.bpGradeColorMap[grade]
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
    alertHtnEnrollment() {
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
        }
      ])
    },
    async enrollInHTN() {
      try {
        const program  = new PatientProgramService(this.patientID)
        program.setProgramId(this.HTNProgramID)
        program.setStateDate(ProgramService.getSessionDate())
        program.setStateId(this.aliveState)
        await program.enrollProgram()
        await program.updateState()
        this.isEnrolledInHTN = true
        toastSuccess('Patient is now enrolled in HTN')
      } catch (e) {
        console.error(e)
        toastWarning(e)
      }
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
      if (this.currentDrugs.length > 0) {
        this.items = [
          {
            label: "Did not take prescribed drugs",
            value: "on treatment",
            other: {
              action: () => this.$router.push(`/art/encounters/bp_adherence/${this.patientID}`)
            }
          },
          {
            label: "Continue drugs",
            value: "on treatment",
            other: {
              action: () => this.$router.push(`/art/encounters/bp_adherence/${this.patientID}`)
            }
          },
          {
            label: "Review drugs",
            value: "on treatment",
            other: {
              action: () => this.$router.push(
                `/art/encounters/bp_adherence/${this.patientID}?review=true`
              )
            }
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
        ]
        if (this.normatensive) {
          this.items.push({
            label: "Return to annual screening",
            value: "Alive",
          })
        }
        this.items.push({
          label: "Start anti hypertensives",
          value: "On treatment",
          other: {
            action: () => this.$router.push(
              `/art/encounters/bp_prescription/${this.patientID}`
            )
          }
        })
      }
    }
  }
})
</script>