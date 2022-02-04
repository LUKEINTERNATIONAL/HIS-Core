<template>
  <ion-page>
    <ion-content>
      <ion-row>
        <ion-col>
          <result-card
            :title="resultTitle"
            :subtitle="resultSubtitle"
            :icon="genderIcon"
          />
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col size="5">
          <div class="large-card">
            <h3> Patients: </h3>
            <ion-list>
              <ion-item
                button
                v-for="(result, index) in results"
                :key="index"
                :detail="true"
                :color="isActive(result.other) ? 'light' : ''"
                @click="onselect(result.other)"
              >
                <ion-avatar> 
                  <ion-img src="/assets/images/avatar.svg"/>
                </ion-avatar>
                <ion-label> {{ result.label }} </ion-label>
              </ion-item>
            </ion-list>
          </div>
        </ion-col>
        <ion-col size="7">
          <div class="large-card">
            <h3> Details: </h3>
            <ion-list>
              <ion-item
                v-for="(opt, index) in demographics"
                :key="index"
                inset="none"
              >
                <ion-label> {{ opt.label }} </ion-label>
                <ion-label slot="end"> {{ opt.value }} </ion-label>
              </ion-item>
            </ion-list>
          </div>
        </ion-col>
      </ion-row>
    </ion-content>
    <ion-footer>
      <ion-toolbar color="dark">
        <ion-button color="danger" size="large" router-link="/">
          Cancel
        </ion-button>
        <ion-button
          color="primary"
          size="large"
          router-link="/search_patient"
          slot="end"
        >
          New Search
        </ion-button>
        <ion-button
          @click="onRegisterAsNew"
          color="primary"
          size="large"
          slot="end"
        >
          New Patient
        </ion-button>
        <ion-button
          v-if="isPersonSelected"
          color="success"
          size="large"
          :router-link="confirmationPageUrl"
          slot="end"
        >
          Continue
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { man, woman, person } from "ionicons/icons";
import {
  IonRow,
  IonLabel,
  IonPage,
  IonCol,
  IonContent,
  IonButton,
  IonFooter,
  IonToolbar,
  IonList,
  IonItem,
} from "@ionic/vue";
import { Patientservice } from "@/services/patient_service";
import { Patient } from "@/interfaces/patient";
import ResultCard from "@/components/DataViews/HisResultCard.vue";
import { alertConfirmation } from "@/utils/Alerts"
export default defineComponent({
  components: {
    ResultCard,
    IonLabel,
    IonRow,
    IonPage,
    IonFooter,
    IonContent,
    IonButton,
    IonCol,
    IonToolbar,
    IonList,
    IonItem,
  },
  data: () => ({
    person,
    gname: "" as any,
    fname: "" as any,
    gender: "" as any,
    results: [],
    selectedPerson: {} as any,
    isPersonSelected: false,
    demographics: [] as any
  }),
  computed: {
    resultTitle(): string {
      return `${this.results.length} Result(s) found`;
    },
    resultSubtitle(): string {
      return `Search term "${this.gname} ${this.fname}"`;
    },
    genderIcon(): any {
      return this.gender === "M" ? man : woman;
    },
    confirmationPageUrl(): string {
      return `/patients/confirm?person_id=${this.selectedPerson.getID()}`;
    }
  },
  watch: {
    $route: {
      async handler({ query }: any) {
        this.selectedPerson = {};
        this.isPersonSelected = false;
        this.gname = query.given_name;
        this.fname = query.family_name;
        this.gender = query.gender;
        this.results = await this.fetchResults(
          this.gname,
          this.fname,
          this.gender
        );
        this.showDetails({});
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    async fetchResults(gname: string, fname: string, gender: string) {
      const patients = await Patientservice.search({
        'given_name': gname, 'family_name': fname, gender
      });
      return patients.map((item: Patient) => {
        const patient = new Patientservice(item);
        return {
          label: patient.getPatientInfoString(),
          value: patient.getID(),
          other: patient,
        };
      });
    },
    async onRegisterAsNew() {
      const confirmation = await alertConfirmation(
        'Do you want to register person as new patient?', 
        {
          header: `Register ${this.gname} ${this.fname}`
        }
      )

      if (confirmation) {
        const gender = this.gender === "M" ? "Male" : "Female";
        this.$router.push(`/patient/registration?given_name=${this.gname}&family_name=${this.fname}&gender=${gender}`)
      }
    },
    isActive(person: any): boolean {
      try {
        return person.getID() === this.selectedPerson.getID()
      }catch (e) { return false}
    },
    onselect(person: any) {
      this.isPersonSelected = true;
      this.selectedPerson = person;
      this.showDetails(person);
    },
    getPatientProp(patient: any, prop: string) {
      return prop in patient ? patient[prop]() : '-'
    },
    showDetails(person: any) {
      this.demographics = [
        {
          label: "Patient ID",
          value: this.getPatientProp(person, 'getNationalID')
        },
        {
          label: "Name",
          value: this.getPatientProp(person, 'getFullName'),
        },
        {
          label: "Gender",
          value: this.getPatientProp(person, 'getGender'),
        },
        {
          label: "Birthdate",
          value: this.getPatientProp(person, 'getBirthdate'),
        },
        {
          label: "Home District",
          value: this.getPatientProp(person, 'getHomeDistrict'),
        },
        {
          label: "Home Village",
          value: this.getPatientProp(person, 'getHomeVillage'),
        },
        {
          label: "Current District",
          value: this.getPatientProp(person, 'getCurrentDistrict'),
        },
        {
          label: "Current T/A",
          value: this.getPatientProp(person, 'getCurrentTA'),
        },
      ];
    },
  },
});
</script>
<style scoped>
.large-card {
  padding: 5%;
  border-radius: 15px;
  border: 1px solid #ccc;
  height: 70vh;
  background-color: rgb(255, 255, 255);
  overflow-y: auto;
  -webkit-box-shadow: 0px -2px 19px -2px rgba(196, 190, 196, 1);
  -moz-box-shadow: 0px -2px 19px -2px rgba(196, 190, 196, 1);
  box-shadow: 0px -2px 19px -2px rgba(196, 190, 196, 1);
}
</style>