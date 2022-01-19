<template>
  <ion-page style="background: #fff">
    <information-header :items="patientCardInfo"></information-header>
    <ion-content>
      <visit-information
        :items="visitDates"
        @onPrint="printLabel"
        @onDetails="showMore"
        style="font-size: 11px;"
      ></visit-information>
    </ion-content>
    <his-footer :btns="btns" />
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
import HisFooter from "@/components/HisDynamicNavFooter.vue";
import _, { isArray, isEmpty } from "lodash";
import {
  IonPage,
  IonContent,
  modalController,
} from "@ionic/vue";
import { EncounterService } from "@/services/encounter_service";
import { RelationshipService } from "@/services/relationship_service";
import { alertConfirmation } from "@/utils/Alerts";
import { ProgramService } from "@/services/program_service";
import { PatientPrintoutService } from "@/services/patient_printout_service";
import { NavBtnInterface } from "@/components/HisDynamicNavFooterInterface";
export default defineComponent({
  components: {
    IonPage,
    IonContent,
    VisitInformation,
    InformationHeader,
    HisFooter
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
    btns: [] as Array<NavBtnInterface>,
    guardians: ''
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
      this.guardians = await this.getGuardian();
      this.btns.push(this.getCancelBtn())
      this.btns.push(this.getDemographicsBtn())
      if(!this.guardians) this.btns.push(this.getGuardianBtn())
    },
    async getGuardian(){
      const relationship = await RelationshipService.getGuardianDetails(this.patientId);
      return relationship.map((r: any) => {
        return ` ${r.name} (${r.relationshipType})`;
      }).join(" ");
    },
    getDemographicsBtn(): NavBtnInterface{
     return {
        name: "Edit Demographics",
        color: "primary",
        size: "large",
        slot: "end",
        visible: true,
        onClick: () => {
          return this.$router.push({
            path: '/patient/registration', 
            query: { 'edit_person': this.patientId }
          })
        }
      }
    },
    getCancelBtn(): NavBtnInterface {
      return {
        name: "Cancel",
        color: "danger",
        size: "large",
        slot: "start",
        visible: true,
        onClick: async () => {
          const confirmation = await alertConfirmation("Are you sure you want to cancel?");
          if (confirmation) return this.$router.back();
        }
      }
    },
    getGuardianBtn(): NavBtnInterface {
      return {
        name: "Add Guardian",
        color: "primary",
        size: "large",
        slot: "end",
        visible: true,
        onClick: () => {
          return this.$router.push(`/guardian/registration/${this.patientId}`);
        }
      }
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
      const { toStandardHisDisplayFormat } = HisDate;
      const age = patient.getAge();
      const ARVNumber = patient.getPatientIdentifier(4);
      const IDNumber = patient.getPatientIdentifier(3);
      const fullName = this.getProp(patient, "getFullName");
      const gender = patient.getGender();
      const currentVillage = patient.getCurrentVillage();
      const closestLandMark = patient.getAttribute(19);
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
      
      startDate = !isEmpty(startDate) 
        ? toStandardHisDisplayFormat(startDate[0].value_datetime)
        : 'N/A'
      
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

      const tb = await this.getTBStats()
      
      const obj: Option[] = [
        { label: "ARV #", value: ARVNumber },
        { label: "National Patient ID", value: IDNumber },
        { label: "Name", value: fullName },
        { label: "Age", value: age },
        { label: "Sex", value: gender },
        { label: "Location", value: currentVillage },
        { label: "Landmark", value: closestLandMark },
        { label: "Guardian", value: this.guardians },
        { label: "Init W(KG)", value: initialWeight },
        { label: "Init H(CM)", value: initialHeight },
        { label: "BMI(CM)", value: initialBMI },
        { label: "TI", value: TI },
        { label: "Agrees to follow up", value: agreesToFollowUp },
        { label: "Reason for starting ART", value: reasonForStarting },
        { label: "HIV test date", value: `${dateOfTest ? dateOfTest  : ''}`},
        { label: "HIV test place", value: ` ${placeOfTest? placeOfTest : ''}`},
        { label: "Date of starting first line ART", value: startDate },
        { label: "Pulmonary TB within the last 2 years", value: tb.lastTwoYears},
        { label: "Extra pulmonary TB (EPTB)", value: tb.eptb},
        { label: "Pulmonary TB (current)", value: tb.currentTB},
        { label: "Kaposi's sarcoma:", value: tb.ks}
      ];
      return obj;
    },

    async getTBStats(){
      const stats = await ObservationService.getFirstValueCoded(this.patientId, 'Who stages criteria present')
      return {
        lastTwoYears: stats && stats.match(/last/i) ? "Yes" : "N/A",
        eptb: stats && stats.match(/eptb/i) ? "Yes" : "N/A",
        currentTB: stats && stats.match(/current/i) ? "Yes" : "N/A",
        ks: stats && stats.match(/kepos/i) ? "Yes" : "N/A",
      }
    },

    async getInitial(concept: string) {
      try {
        const initialObs = await ObservationService.getAll(
          this.patientId,
          concept
        );
        const lastIndex = initialObs.length - 1;
        return initialObs[lastIndex].value_numeric;
      } catch (e) {
        console.error(e)
      }
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