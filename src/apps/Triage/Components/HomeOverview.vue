<template>
  <ion-page>
    <ion-header >
      <ion-toolbar>
        <ion-row class="header">
          <ion-col size="3"> 
            <ion-row style="width: 200px;" >  
                <ion-thumbnail>
                  <ion-img :src="appLogo"></ion-img>
                </ion-thumbnail>
            
                <p style="margin-top: 8px;font-size: 28px;font-weight: 500;">
                  {{ app.applicationName }}
                </p>
                <span style="margin-top:20px;margin-left:5px">
                  v1.0.1
                </span>
            </ion-row>  
          </ion-col>

           <ion-row >
            <ion-icon
              :icon="person"
              size="large"
              style="height: 40%;margin-top: 17px;margin-right: 10px;padding-bottom: 10px;"
              @click="personPopover"
            ></ion-icon>
            <ion-icon
              :icon="menu"
              size="large"
              style="height: 100%"
              @click="menuPopover"
            ></ion-icon>
          </ion-row>
        </ion-row>
      </ion-toolbar>
    </ion-header>
 

    <ion-content >
      <ion-grid id="container" style="margin-top:5%">
    <center><ion-row>
      
 <ion-card class="his-card" @click="scanner()">
    <center> 
      <ion-img class="home_icons" :src="'/assets/images/qr_plus_barcode.png'"></ion-img>
      <ion-card-header>
        <ion-card-title>Scan</ion-card-title>
      </ion-card-header>
    </center>
  </ion-card> 

   <ion-card class="his-card" @click="searchPatient">
    <center> 
      <ion-img class="home_icons" :src="'/assets/images/search_plus_add.png'"></ion-img>
      <ion-card-header>
        <ion-card-title>Find or Register</ion-card-title>
      </ion-card-header>
    </center>
  </ion-card> 

   <ion-card class="his-card" @click="openModal">
    <center> 
      <ion-img class="home_icons" :src="'data:image/png;base64,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'"></ion-img>
      <ion-card-header>
        <ion-card-title>Applications</ion-card-title>
      </ion-card-header>
    </center>
  </ion-card> 
  
    </ion-row></center>
</ion-grid>
  <ion-row class="dairy_s">
    <h3>Daily Statistics</h3>
      <table>
        <tr>
          <td >Registered Clients</td>
          <td >{{registeredToday}}</td>
        </tr><tr>
          <td >High Fever Clients</td>
          <td >{{highFeverToday}}</td>
        </tr><tr>
          <td >Respiratory Cases</td>
          <td >{{respiratoryToday}}</td>
        </tr>
      </table>
  </ion-row>
    </ion-content> 

  </ion-page>


  
</template>

<script lang="ts">
import {
  IonHeader,
  IonPage,
  IonToolbar,
  IonIcon,
  IonRow,
  IonCol,
  IonImg,
  IonThumbnail
} from "@ionic/vue";



import HisApp from "@/apps/app_lib"
import { defineComponent, ref } from "vue";
import { barcode } from "ionicons/icons";
import { menu,person } from "ionicons/icons";
import { GlobalPropertyService } from "@/services/global_property_service"
import { ObservationService } from "@/services/observation_service"
import ApiClient from "@/services/api_client";
import { Service } from "@/services/service"
import {popoverController } from '@ionic/vue';
import menuPopver from './MenuPopover.vue'
import personPopver from './PersonPopover.vue'

import HisDate from "@/utils/Date"
import Img from "@/utils/Img"
import dayjs from "dayjs";
import GLOBAL_PROP from "@/apps/GLOBAL_APP/global_prop"
import { AuthService } from "@/services/auth_service"
export default defineComponent({
  name: "Home",
  components: {
    IonHeader,
    IonPage,
    IonToolbar,
    IonIcon,
    IonRow,
    IonCol,
    IonImg,
    IonThumbnail
  },
  data() {
    return {
      dayjs,
      startDate: "",
      endDate: "",
      registeredToday: 0,
      respiratoryToday: 0,
      highFeverToday: 0,
      app:  {} as any,
      facilityName: "",
      userLocation: "",
      sessionDate: "",
      userName: "",
      APIVersion: "",
      activeTab: 1,
      ready: false,
      patientBarcode: "",
      QrcodeVue: '',
      isBDE: false
    };
  },
  setup() {
    return {
      menu,
      person
    };
  },
  async mounted() {
    this.startDate = this.dayjs().format("YYYY-MM-DD");
   await ObservationService.getObs({
            'concept_id': '7644',
            'start_date': this.startDate,
            'end_date': this.startDate,
            'page_size': 500
        }).then(
        (data: any) => {
          this.respiratoryToday = data.length;
        }
      );

       await ObservationService.getObs({
            'concept_id': '10539',
            'start_date': this.startDate,
            'end_date': this.startDate,
            'page_size': 500
      }).then(
        (data: any) => {
          this.registeredToday = data.length;
        }
      );
        await ObservationService.getObs({
            'concept_id': '5945',
            'start_date': this.startDate,
            'end_date': this.startDate,
            'page_size': 500
      }).then(
        (data: any) => {
          this.highFeverToday = data.length;
        }
      );

      const app = HisApp.getActiveApp()
      if (!app) {
        this.openModal();
      } else {
        this.app = app
        this.loadApplicationData();
      }
  },
  computed: {
    appLogo(): string {
      return Img(this.app.applicationIcon)
    },
    canFindByIdentifier(): boolean {
      return this.app.programPatientIdentifiers ? true : false
    },
    canReport(): boolean {
      return this.app.programReports ? true : false
    }
  },
  methods: {
    searchPatient()
    {
      this.$router.push('/triage_search_patient/undefined/undefined/undefined/undefined/undefined');
    },
    async personPopover(ev: Event) {
      const popover = await popoverController
        .create({
          component: personPopver,
          cssClass: 'menu',
          event: ev,
          translucent: true,
          showBackdrop: false
        })
      await popover.present();

      const { role } = await popover.onDidDismiss();
      console.log('onDidDismiss resolved with role', role);
    },

    async menuPopover(ev: Event) {
      const popover = await popoverController
        .create({
          component: menuPopver,
          cssClass: 'menu',
          event: ev,
          translucent: true,
          showBackdrop: false
        })
      await popover.present();

      const { role } = await popover.onDidDismiss();
      console.log('onDidDismiss resolved with role', role);
    },
    async scanner(){
  
     this.$router.push('/scanner');
    },
    fetchLocationID: async function () {
      const centerID = await GLOBAL_PROP.healthCenterID()

      if (centerID) this.fetchLocationName(centerID);
    },
    fetchLocationUUID: async function () {
      const uuid = await GLOBAL_PROP.siteUUID()

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
       if(this.app.applicationName != "Triage")
        window.location.href = "/home"
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
      if((await GLOBAL_PROP.portalEnabled())) {
        const portalLocation = await GLOBAL_PROP.portalProperties();
        window.location = portalLocation;
      }else {
        this.$router.push('/login')
      }
      auth.clearSession()
    }
  },
 });
</script>

<style scoped>
ion-col p {
  margin: 0;
}
ion-button {
  width: 100%;
}

.outlined {
  border: solid 1px grey;
  font-size: 100%;
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
 font-size: 26px;
line-height: 22px;
color: #8c8c8c;
margin: 0;
font-weight: bold;
}
.header{
  display: flex;
justify-content: space-between;
padding-left: 10px;
padding-right: 11px;
}
#container a {
  text-decoration: none;
  margin-top: 10%;
}
#container {
  margin : auto 0;
}
.barcode-input{
  height: 100%;
  font-size: 100%;
}
.center
{
  margin: 0 auto;
}
.login-bnt
{
  margin-top: 10px;
margin-right: 6px;
}
select {
  border: none;
    height: 40px;
    margin: 10px;
}
.home-btn
{
  margin-top:4%;
  width: 33%;
  font-size: 19px;
}
.modal-wrapper.ion-overlay-wrapper.sc-ion-modal-md {
    width: 100%;
    height: 100%;
}
ion-toolbar {
  display: flex; 
}
.his-card {
  width: 25%;
    margin: 0 auto;
    max-height: 210px;
}
.home_icons {
    width: 25% !important;
}
table {
  font-family: arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

td, th {
  /* border: 1px solid #dddddd; */
  box-shadow: inset 0 -1px 0 0 rgba(100,121,143,0.122);
  text-align: left;
  background: rgba(242,245,245,0.8);
  padding: 20px;
  border: 1px solid #d1d1d1;
}

tr:hover {
    box-shadow: inset 1px 0 0 #dadce0,inset -1px 0 0 #dadce0,0 1px 2px 0 rgba(60,64,67,.3),0 1px 3px 1px rgba(60,64,67,.15);
    z-index: 2;
}
tr:nth-child(even) {
  background-color: #dddddd;
}
.dairy_s{
  width: 90%;
margin: 0 auto;
    margin-top: 0px;
margin-top: 30px;
}
</style>