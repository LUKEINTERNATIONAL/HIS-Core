<template>
  <ion-page>
    <ion-content>
      <information-header :items="patientCardInfo"></information-header>
      <visit-information
        :items="visitDates"
        @onPrint="printLabel"
        @onDetails="showMore"
      ></visit-information>
    </ion-content>
    <ion-footer>
      <ion-toolbar color="dark">
        <ion-button color="danger" size="large" @click="onCancel">
          Cancel
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import HisDate from "@/utils/Date";
import { Encounter } from "@/interfaces/encounter";
import { Option } from "@/components/Forms/FieldInterface";
import { Patient } from "@/interfaces/patient";
import { Patientservice } from "@/services/patient_service";
import { ObservationService } from "@/services/observation_service";
import InformationHeader from "@/components/InformationHeader.vue";
import VisitInformation from "@/components/VisitInformation.vue";
import MastercardDetails from "@/components/MastercardDetails.vue";
import _, { isArray, reduce } from "lodash";
import {
  IonPage,
  IonContent,
  IonButton,
  IonFooter,
  IonToolbar,
  modalController,
} from "@ionic/vue";
import { EncounterService } from "@/services/encounter_service";
import { RelationshipService } from "@/services/relationship_service";
import { alertConfirmation } from "@/utils/Alerts";
import { ProgramService } from "@/services/program_service";
import { PatientPrintoutService } from "@/services/patient_printout_service";
export default defineComponent({
  components: {
    IonPage,
    IonFooter,
    IonContent,
    IonButton,
    IonToolbar,
    VisitInformation,
    InformationHeader,
  },
  data: () => ({
    isBDE: false as boolean,
    currentDate: "",
    sessionDate: "",
    nextTask: {} as any,
    patientId: 0 as any,
    programID: 0,
    patient: {} as any,
    patientProgram: {} as Array<Option>,
    patientCardInfo: [] as any,
    programCardInfo: [] as Array<Option> | [],
    encounters: [] as Array<Encounter>,
    medications: [] as any,
    labOrders: [] as any,
    visitDates: [] as Array<Option> as any,
    activeVisitDate: "" as string | number,
    encountersCardItems: [] as Array<Option>,
    medicationCardItems: [] as Array<Option>,
    labOrderCardItems: [] as Array<Option>,
    alertCardItems: [] as Array<Option>,
  }),
  computed: {
    visitDatesTitle(): string {
      return `${this.visitDates.length} Visits`;
    },
  },
  watch: {
    $route: {
      async handler({ params }: any) {
        if (!params) return;

        this.patientId = parseInt(params.patient_id);

        if (this.patientId) this.init();
      },
      deep: true,
      immediate: true,
    },
    async activeVisitDate(date: string) {
      this.encounters = await EncounterService.getEncounters(this.patientId, {
        date,
      });
    },
  },
  methods: {
    async init() {
      this.patient = await this.fetchPatient(this.patientId);
      this.patientCardInfo = await this.getPatientCardInfo(this.patient);
      this.visitDates = await this.getPatientVisitDates(this.patientId);
    },
    async fetchPatient(patientId: number | string) {
      const patient: Patient = await Patientservice.findByID(patientId);
      return patient ? new Patientservice(patient) : {};
    },
    getProp(data: any, prop: string): string {
      return prop in data ? data[prop]() : "-";
    },
    async getPatientVisitDates(patientId: number) {
      const dates = await Patientservice.getPatientVisits(patientId);
      const f = dates.map((date: string) => {
        return this.getExtras(date).then((d) => {
          return {
            label: HisDate.toStandardHisDisplayFormat(date),
            value: date,
            data: d,
          };
        });
      });
      const y = await Promise.all(f);
      return y;
    },
    async getExtras(date: any) {
      return await ProgramService.getCurrentProgramInformation(
        this.patientId,
        date
      );
    },
    onActiveVisitDate(data: Option) {
      this.activeVisitDate = data.value;
    },
    async getPatientCardInfo(patient: Patientservice) {
      const { toStandardHisDisplayFormat, getAgeInYears } = HisDate;
      const birthDate = this.getProp(patient, "getBirthdate");
      const age = patient.getAge();
      const ARVNumber = patient.getPatientIdentifier(4);
      const IDNumber = patient.getPatientIdentifier(3);
      const fullName = this.getProp(patient, "getFullName");
      const gender = patient.getGender();
      const currentDistrict = patient.getCurrentDistrict();
      const currentVillage = patient.getCurrentVillage();
      const currentTA = patient.getCurrentTA();
      const closestLandMark = patient.getAttribute(19);
      const phoneNumber = patient.getPhoneNumber();
      let dateOfTest = await ObservationService.getAll(
        this.patientId,
        "Confirmatory HIV test date"
      );
      if(dateOfTest) {
        dateOfTest = toStandardHisDisplayFormat(dateOfTest[0].value_datetime);
      }
      const placeOfTest = await ObservationService.getFirstValueText(
        this.patientId,
        "Confirmatory HIV test location"
      );

      let startDate = await ObservationService.getAll(
        this.patientId,
        "Date ART started"
      );
      startDate = toStandardHisDisplayFormat(startDate[0].value_datetime);

      let guardians = "";
      RelationshipService.getGuardianDetails(this.patientId).then(
        (relationship: any) => {
          const rel = relationship.map((r: any) => {
            return ` ${r.name} (${r.relationshipType})`;
          });
          guardians = rel.join(" ");
        }
      );
      const initialWeight = await this.getInitial("weight");
      const initialHeight = await this.getInitial("Height");
      const initialBMI = await this.getInitial("BMI");
      const TI = await ObservationService.getFirstValueCoded(
        this.patientId,
        "Ever received ART"
      );
      const agreesToFollowUp = await ObservationService.getFirstValueCoded(
        this.patientId,
        "Agrees to followup"
      );
      const reasonForStarting = await ObservationService.getFirstValueCoded(
        this.patientId,
        "Reason for ART eligibility"
      );

      const obj: Option[] = [
        { label: "ARV #", value: ARVNumber },
        { label: "National Patient ID", value: IDNumber },
        { label: "Name", value: fullName },
        { label: "Age", value: age },
        { label: "Sex", value: gender },
        { label: "Location", value: currentVillage },
        { label: "Landmark", value: closestLandMark },
        { label: "Guardian", value: guardians },
        { label: "Init W(KG)", value: initialWeight },
        { label: "Init H(CM)", value: initialHeight },
        { label: "BMI(CM)", value: initialBMI },
        { label: "TI", value: TI },
        { label: "Agrees to follow up", value: agreesToFollowUp },
        { label: "Reason for starting", value: reasonForStarting },
        {
          label: "Date + place of HIV test",
          value: `${dateOfTest ? dateOfTest  : ''} ${placeOfTest? placeOfTest : ''}`,
        },
        { label: "Date of starting first line ART", value: startDate },
      ];
      return obj;
    },

    async getInitial(concept: string) {
      const initialObs = await ObservationService.getAll(
        this.patientId,
        concept
      );
      const lastIndex = initialObs.length - 1;
      return initialObs[lastIndex].value_numeric;
    },
    async openModal(items: any, title: string, component: any) {
      const date = HisDate.toStandardHisDisplayFormat(
        this.activeVisitDate.toString()
      );
      const modal = await modalController.create({
        component: component,
        backdropDismiss: false,
        cssClass: "custom-modal",
        componentProps: {
          items,
          title: `${title}: ${date}`,
          taskParams: {
            patient: this.patient.getObj(),
            program: this.patientProgram,
            visitDate: this.activeVisitDate,
            patientID: this.patientId,
          },
        },
      });
      modal.present();
    },
    async onCancel() {
      const confirmation = await alertConfirmation(
        "Are you sure you want to cancel?"
      );

      if (confirmation) return this.$router.back();
    },
    printLabel(date: any) {
      new PatientPrintoutService(this.patientId).printVisitSummaryLbl(date);
    },
    FormData(data: any) {
      return Object.keys(data).map((d) => {
        const display: any = data[d];
        return {
          label: this.camelCase(d),
          value: this.joinData(display),
        };
      });
    },
    joinData(vals: any) {
          if (isArray(vals)) {
            const f = [...vals];
            if (isArray(f)) {
              let j = "";
              f.forEach((element) => {
                j += `${element.join(":")}, `;
              });
              return j;
            }
            return f;
          } else {
            return vals;
          }
    },
    camelCase(val: string) {
      const label = val.split("_");
      return `${this.capitalize(label[0])} ${this.capitalize(label[1])}`;
    },
    capitalize(val: string) {
      try {
        return val.charAt(0).toUpperCase() + val.slice(1);
      } catch (error) {
        return "";
      }
    },  
    async showMore(date: any) {
      const title = "Visit details for";
      const data = await this.getExtras(date);
      const modal = await modalController.create({
        component: MastercardDetails,
        backdropDismiss: false,
        cssClass: "custom-modal",
        componentProps: {
          title: `${title}: ${date}`,
          visitData: this.FormData(data),
        },
      });
      modal.present();
    },
  },
});
</script>
<style scoped>
.grid-custom {
  overflow-y: auto;
  padding: 1%;
}
.his-card {
  height: 100%;
  padding: 1.8%;
}
@media only screen and (width: 1024px) {
  .grid-custom {
    height: 99%;
    overflow: hidden;
  }
}
</style>