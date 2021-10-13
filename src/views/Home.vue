<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-row>
          <ion-col>
            <div class="tool-bar-medium-card">
              <ion-row> 
                <ion-col size-lg="5" size-sm="4"> 
                  <img 
                    :style="{
                      width: '230px', 
                      height: '90px',
                      margin: '0'
                    }"
                    :src="barcodeLogo"/>
                </ion-col>
                <ion-col size-lg="7" size-sm="8"> 
                  <input v-model="patientBarcode" class="barcode-input" ref="scanBarcode"/>
                </ion-col>
              </ion-row>
            </div>
          </ion-col>
          <ion-col size="5">
            <div class="tool-bar-medium-card">
              <div class="tool-bar-medium-content"> 
                <p><b>Facility name:</b> {{ facilityName }}</p>
                <p><b>Location:</b> {{ userLocation }}</p>
                <p><b>Date:</b> <ion-label :color="isBDE ? 'danger' : 'success'"> {{ sessionDate }} </ion-label></p>
                <p><b>User:</b> {{ userName }}</p>
              </div>
            </div>
          </ion-col>
          <ion-col size="3">
            <program-icon :icon="appLogo"> </program-icon>
          </ion-col>
        </ion-row>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div id="container" class="his-card overview" v-if="ready">
        <ion-segment scrollable value="1" class="ion-justify-content-center">
          <ion-segment-button value="1" @click="activeTab = 1">
            <ion-label>Overview</ion-label>
          </ion-segment-button>
          <ion-segment-button value="2" @click="activeTab = 2">
            <ion-label>Reports</ion-label>
          </ion-segment-button>
          <ion-segment-button value="3" @click="activeTab = 3">
            <ion-label>Administration</ion-label>
          </ion-segment-button>
        </ion-segment>
        <component 
          v-if ="activeTab == 1" 
          v-bind:is="appOverview"
          > 
        </component>
        <home-folder
          v-if="activeTab == 2"
          :items="appReports"
          >
        </home-folder>
        <home-folder 
          v-if="activeTab == 3"
          :items="app.globalPropertySettings" 
          >
        </home-folder>
      </div>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-row>
          <ion-col>
            <ion-button color="danger left" size="large" @click="signOut"
              >Logout</ion-button
            >
          </ion-col>
          <ion-col v-if="canFindByIdentifier">
            <ion-button color="primary" size="large" router-link="/patients/search/by_arv">Find By</ion-button>
          </ion-col>
          <ion-col>
            <ion-button color="primary" size="large" router-link="/patient/registration"
              >Find or Register</ion-button
            >
          </ion-col>
          <ion-col>
            <ion-button color="primary" size="large" @click="openModal"
              >Applications</ion-button
            >
          </ion-col>
        </ion-row>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import {
  IonContent,
  IonHeader,
  IonFooter,
  IonPage,
  IonToolbar,
  IonRow,
  IonCol,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonLabel
} from "@ionic/vue";
import HisApp from "@/apps/app_lib"
import { defineComponent } from "vue";
import { barcode } from "ionicons/icons";
import { GlobalPropertyService } from "@/services/global_property_service"
import ApiClient from "@/services/api_client";
import HisDate from "@/utils/Date"
import { AppInterface, FolderInterface } from "@/apps/interfaces/AppInterface";
import { Service } from "@/services/service"
import ProgramIcon from "@/components/DataViews/DashboardAppIcon.vue"
import HomeFolder from "@/components/HomeComponents/HomeFolders.vue"
import Img from "@/utils/Img"

export default defineComponent({
  name: "Home",
  components: {
    ProgramIcon,
    HomeFolder,
    IonContent,
    IonHeader,
    IonPage,
    IonToolbar,
    IonRow,
    IonCol,
    IonButton,
    IonFooter,
    IonSegment,
    IonSegmentButton,
    IonLabel
  },
  data() {
    return {
      app: {} as AppInterface,
      facilityName: "",
      userLocation: "",
      sessionDate: "",
      userName: "",
      APIVersion: "",
      activeTab: 1,
      ready: false,
      patientBarcode: "",
      overviewComponent: {} as any,
      isBDE: false
    };
  },
  computed: {
    barcodeLogo(): string {
      return Img('barcode.svg')
    },
    appOverview(): any {
      return this.app.homeOverviewComponent
    },
    appLogo(): string {
      return Img(this.app.applicationIcon)
    },
    appReports(): FolderInterface[] {
      return this.app.programReports ? this.app.programReports: []
    },
    appAdministration(): FolderInterface[] {
      return this.app.globalPropertySettings ? this.app.globalPropertySettings: []
    },
    canFindByIdentifier(): boolean {
      return this.app.programPatientIdentifiers ? true : true
    }
  },
  methods: {
    fetchLocationID: async function () {
      const centerID = await GlobalPropertyService.getCurrentHealthCenterId()

      if (centerID) this.fetchLocationName(centerID);
    },
    fetchLocationUUID: async function () {
      const uuid = await GlobalPropertyService.getSiteUUID()

      if (uuid) sessionStorage.siteUUID = uuid
    },
    fetchSessionDate: async function () {
      const response = await ApiClient.get("current_time");

      if (!response || response.status !== 200) return; // NOTE: Targeting Firefox 65, can't `response?.status`

      const data = await response.json();
      this.sessionDate = HisDate.toStandardHisDisplayFormat(data.date);
      sessionStorage.sessionDate = data.date;
      // this.fetchLocationName(data.current_health_center_id);
    },
    async fetchAPIVersion() {
      const response = await ApiClient.get("version");
      if (!response || response.status !== 200) return;

      const data = await response.json();

      this.APIVersion = data["System version"];
      sessionStorage.APIVersion = data["System version"];
    },
    async fetchLocationName(locationID: string) {
      const response = await ApiClient.get("locations/" + locationID);

      if (!response || response.status !== 200) return;

      const data = await response.json();
      this.facilityName = data.name;
      this.createSessionLocationName(data);
    },
    createSessionLocationName(data: any) {
      sessionStorage.location = data.name;
      sessionStorage.locationName = data.name;
    },
    loadApplicationData() {
      if (!Service.isBDE()) {
        this.fetchSessionDate();
      } else {
        this.sessionDate = Service.getSessionDate()
        this.isBDE = true
      }
      this.ready = true;
      this.userLocation = sessionStorage.userLocation;
      this.userName = sessionStorage.username;
      this.fetchLocationID();
    },
    async openModal() {
      const data = await HisApp.selectApplication() 
      this.app = data
      this.loadApplicationData();
    },
    checkForbarcode(){
      if(this.patientBarcode.match(/.+\$$/i) != null){
        const patientBarcode = this.patientBarcode.replaceAll(/\$/gi, '');
        this.patientBarcode = '';
        this.$router.push('/patients/confirm?patient_barcode='+patientBarcode);
      }
    },
    async signOut() {
      const portalStatus = await GlobalPropertyService.get('portal.enabled');
      if(portalStatus === "true") {
        const portalLocation = await GlobalPropertyService.get('portal.properties');
        sessionStorage.clear();
        window.location = portalLocation;
      }else {
        sessionStorage.clear();
        this.$router.push('/login')
      }
    }
  },
  created() {
    setInterval(() => {
      const barcodeElement = this.$refs.scanBarcode as HTMLInputElement
      if (barcodeElement) {
        barcodeElement.focus()
      }
    }, 1500)
  },
  mounted(){
    const app = HisApp.getActiveApp()
    if (!app) {
      this.openModal();
    } else {
      this.app = app
      this.loadApplicationData();
    }
  },
  setup() {
    return {
      barcode,
    };
  },
  watch: {
    patientBarcode: function() {
      this.checkForbarcode();
    }
  }
});
</script>

<style scoped>
.tool-bar-medium-content {
  padding: 10px;
}
.tool-bar-medium-card {
  height: 100px;
  font-size: 0.9em;
}
ion-col p {
  margin: 0;
}
ion-button {
  width: 100%;
}
.overview {
  min-height: 66vh;
  margin: 14px;
}
.subheader {
  font-weight: bold;
}
#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;

  color: #8c8c8c;

  margin: 0;
}

#container a {
  text-decoration: none;
}
.barcode-input{
  font-size: 3em;
  width: 100%;
  height: 90%;
  color: black;
  background-color: white;
}
input {
  border: none;
}
input:focus {
  outline: none;
}
</style>