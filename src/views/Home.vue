<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar class="mobile-component-view">
        <ion-title> {{ facilityName }} </ion-title>
        <ion-buttons slot="end">
          <ion-thumbnail> 
            <img :src="appLogo" class="logo" alt="App Logo"/>
          </ion-thumbnail>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar class="full-component-view">
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
                  <input 
                    :readonly="isReadOnly" 
                    v-model="patientBarcode" 
                    class="barcode-input" 
                    ref="scanBarcode"
                  />
                </ion-col>
              </ion-row>
            </div>
          </ion-col>
          <ion-col size="5">
            <div class="tool-bar-medium-card">
              <div class="tool-bar-medium-content"> 
                <p>Facility name: <b>{{ facilityName }}</b></p>
                <p>Location: <b> {{ userLocation }}</b></p>
                <p>Date: <ion-label :color="isBDE ? 'danger' : 'success'">
                  <b> {{ sessionDate }} </b> 
                  </ion-label></p>
                <p>User:<b> {{ userName }}</b></p>
              </div>
            </div>
          </ion-col>
          <ion-col size="3">
            <program-icon :icon="appLogo"> </program-icon>
          </ion-col>
        </ion-row>
      </ion-toolbar>
    </ion-header>

    <ion-toolbar> 
      <ion-segment scrollable :value="activeTab" class="ion-justify-content-center">
        <ion-segment-button :value="1" @click="activeTab = 1">
          <ion-icon :icon="statsChart"> </ion-icon>
          <ion-label>Overview</ion-label>
        </ion-segment-button>
        <ion-segment-button v-if="canReport" :value="2" @click="activeTab = 2">
          <ion-icon :icon="pieChart"> </ion-icon>
          <ion-label>Reports</ion-label>
        </ion-segment-button>
        <ion-segment-button :value="3" @click="activeTab = 3">
          <ion-icon :icon="settings"> </ion-icon>
          <ion-label>Administration</ion-label>
        </ion-segment-button>
      </ion-segment>
    </ion-toolbar>
    
    <ion-content :fullscreen="true">
      <div id="container" class="his-card overview" v-if="ready">
        
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
          <ion-button class="xl-button mobile-component-view" color="danger" @click="signOut">
            <ion-icon :icon="logOut"></ion-icon>
          </ion-button>
          <ion-button class="xl-button full-component-view" color="danger" size="large" @click="signOut">
            <ion-icon :icon="logOut"></ion-icon>
            <ion-label> Logout </ion-label>
          </ion-button>
        </ion-col>
        
        <ion-col>
          <ion-button v-if="canFindByIdentifier" class="xl-button mobile-component-view" color="primary" router-link="/patients/search/id">
            <ion-icon :icon="search"> </ion-icon>
          </ion-button>
          <ion-button v-if="canFindByIdentifier" class="xl-button full-component-view" color="primary" size="large" router-link="/patients/search/id">
            <ion-icon :icon="search"> </ion-icon>
            <ion-label> Find By </ion-label>
          </ion-button>
        </ion-col>

        <ion-col>
          <ion-button class="xl-button mobile-component-view" color="primary" router-link="/patient/registration">
            <ion-icon :icon="person"></ion-icon>
          </ion-button>
          <ion-button class="xl-button full-component-view" color="primary" size="large" router-link="/patient/registration">
            <ion-icon :icon="person"></ion-icon>
            <ion-label> Find or Register </ion-label>
          </ion-button>
        </ion-col>

        <ion-col>
          <ion-button class="xl-button mobile-component-view" color="primary" @click="openModal">
            <ion-icon :icon="apps"></ion-icon>
          </ion-button>
          <ion-button class="xl-button full-component-view" color="primary" size="large" @click="openModal">
            <ion-icon :icon="apps"></ion-icon>
            <ion-label> Applications </ion-label>
          </ion-button>
        </ion-col>
        </ion-row>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
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
import { AuthService } from "@/services/auth_service"

import Img from "@/utils/Img"
import { 
  apps, 
  person, 
  search, 
  logOut,
  statsChart,
  pieChart,
  settings
} from 'ionicons/icons';
import {
  IonContent,
  IonHeader,
  IonFooter,
  IonPage,
  IonToolbar,
  IonRow,
  IonCol,
  IonIcon,
  IonButton,
  IonSegment,
  IonButtons,
  IonSegmentButton,
  IonLabel,
  isPlatform
} from "@ionic/vue";
export default defineComponent({
  name: "Home",
  components: {
    IonIcon,
    ProgramIcon,
    HomeFolder,
    IonContent,
    IonHeader,
    IonPage,
    IonButtons,
    IonToolbar,
    IonRow,
    IonCol,
    IonButton,
    IonFooter,
    IonSegment,
    IonSegmentButton,
    IonLabel
  },
  setup() {
    return {
      barcode,
      apps, 
      person, 
      search, 
      logOut,
      statsChart,
      pieChart,
      settings,
      isReadOnly: !isPlatform('desktop')
    }
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
      return this.app.programPatientIdentifiers ? true : false
    },
    canReport(): boolean {
      return this.app.programReports ? true : false
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
      this.ready = true;
      this.isBDE = Service.isBDE() === true
      this.userLocation = sessionStorage.userLocation;
      this.userName = sessionStorage.username;
      this.fetchLocationID();
      this.sessionDate = HisDate.toStandardHisDisplayFormat(
        Service.getSessionDate()
      )
    },
    async openModal() {
      const data = await HisApp.selectApplication('HomePage') 
      if (data) {
        this.app = data
        this.activeTab = 1
        this.loadApplicationData();
      }
    },
    checkForbarcode(){
      if(this.patientBarcode.match(/.+\$$/i) != null){
        const patientBarcode = this.patientBarcode.replaceAll(/\$/gi, '');
        this.patientBarcode = '';
        this.$router.push('/patients/confirm?patient_barcode='+patientBarcode);
      }
    },
    async signOut() {
      const auth = new AuthService()
      const portalStatus = await GlobalPropertyService.get('portal.enabled');
      if(portalStatus === "true") {
        const portalLocation = await GlobalPropertyService.get('portal.properties');
        window.location = portalLocation;
      }else {
        this.$router.push('/login')
      }
      auth.clearSession()
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
  watch: {
    patientBarcode: function() {
      this.checkForbarcode();
    }
  }
});
</script>

<style scoped>
.full-component-view {
    display: block;
}
.mobile-component-view {
    display: none;
}
@media (max-width:900px) {
  .full-component-view {
      display: none;
  }
  .mobile-component-view {
      display: block;
  }
}
ion-icon {
  padding: 0.2em;
}
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
.xl-button {
  width: 100%;
}
.overview {
  min-height: 65vh;
  margin: 0.5em;
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