<template>
  <ion-page>
    <ion-header>
        <ion-toolbar>
            <ion-row>
            <ion-col>
                <ion-text>
                <span class="header-text" >
                  Triage Report
                </span>
                </ion-text>
            </ion-col>
            </ion-row>
        </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <div id="container" class="his-card overview" >
      
        <home-folder
          :items="appReports"
          >
        </home-folder>
      
      </div>
    </ion-content>

    <his-footer :btns="btns" />
  </ion-page>
</template>

<script lang="ts">
import HisApp from "@/apps/app_lib"
import { defineComponent } from "vue";
import { barcode } from "ionicons/icons";
import ApiClient from "@/services/api_client";
import HisDate from "@/utils/Date"
import { AppInterface, FolderInterface } from "@/apps/interfaces/AppInterface";
import { Service } from "@/services/service"
import ProgramIcon from "@/components/DataViews/DashboardAppIcon.vue"
import HomeFolder from "@/components/HomeComponents/HomeFolders.vue"
import { AuthService } from "@/services/auth_service"
import GLOBAL_PROP from "@/apps/GLOBAL_APP/global_prop"
import HisFooter from "@/components/HisDynamicNavFooter.vue";
import { alertConfirmation } from "@/utils/Alerts";
import { NavBtnInterface } from "@/components/HisDynamicNavFooterInterface";

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
  IonThumbnail,
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
  IonTitle,
  isPlatform
} from "@ionic/vue";
export default defineComponent({
  name: "Home",
  components: {
    HomeFolder,
    IonContent,
    IonPage,
    IonToolbar,
    IonRow,
    IonCol,
    HisFooter
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
      appReports: {} as any,
      isBDE: false,
      btns: [] as Array<NavBtnInterface>,
    };
  },

  mounted(){
    this.btns.push(this.getCancelBtn())
        const app = HisApp.getActiveApp()
        if(app){
            this.app = app;
            this.appReports = this.app.programReports ? this.app.programReports: [];
        }

  },
  methods:{
     getCancelBtn(): NavBtnInterface {
      return {
        name: "Cancel",
        color: "danger",
        size: "large",
        slot: "start",
        visible: true,
        onClick: async () => {
          const confirmation = await alertConfirmation("Are you sure you want to exit?");
          if (confirmation) return this.goHome();
        }
      }
    },
    goHome() {
     this.$router.push('/triage');
    },
  }

 
});
</script>

<style scoped>
.his-card{
  --ion-background-color: #fff;
  position: relative !important;
  top: 2% !important;
  border-radius: 5px !important;
  height: 100% !important;
  overflow:scroll;
  /* width: 20%; */
}
.overview[data-v-1df8c567] {
  max-height: 77vh;
}
ion-content{

    --ion-background-color:#e0e0e0;
}
.full-component-view {
    display: block;
}
.mobile-component-view {
    display: none;
}
@media (max-width:900px) {
 
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
  width: 12%;
}
.overview {
  max-height: 63vh;
  min-height: 63vh;
  margin: 0.5em;
  overflow: auto;
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