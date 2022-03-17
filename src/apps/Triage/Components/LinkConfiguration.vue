<template>
  <ion-page>
 
    <ion-content class="ion-padding" :fullscreen="true" >
    <ion-row style="display: flex; justify-content: center; margin-top:40px" >
            <ion-icon
              :icon="settings"
              size="large"
              style="height: 80px; width: 80px;"
              @click="openPopover"
            ></ion-icon>

          </ion-row>
        <ion-row class="header-row"> 
           
          <ion-col>
             
            <ion-text>
                
              <span class="header-text ">
                System Setup
              </span>
            </ion-text>
          </ion-col>
        </ion-row>
      <ion-row>
        <ion-col>
          <form novalidate>
            <ion-list  lines="none" class="get-centered">
              <ion-row>
                <ion-input
                  v-model="ipAddress"
                  name="ipAddress"
                  ref="ipAddress"
                  type="text"
                  spellcheck="false"
                  autocapitalize="off"
                  required
                  class="login_input"
                  placeholder="Enter API IP address"
                >
                </ion-input>
              </ion-row>
              <ion-row > 
              <ion-input
                  ref="port"
                  v-model="port"
                  name="port"
                  type="number"
                  placeholder="Enter API port"
                  class="login_input"
                >
                </ion-input>
              </ion-row>
               <ion-row style="display: flex; justify-content: center;"> 
                  <ion-button class="footer-btns"  id="backButton" color="primary" style="height:40px" @click="submitSystemSetup">Submit</ion-button>
              </ion-row>
              </ion-list>
            </form>
          </ion-col>
        </ion-row>
      </ion-content>
  
  </ion-page>
  <!-- <span class="arrows-background" @click="goHome">
   <ion-icon class="icon-arrow" name="chevron-back" ></ion-icon>
  </span>
  <span class="arrows-background right-arrow" @click="onSave">
    <ion-icon class="icon-arrow" name="chevron-forward" ></ion-icon>
  </span> -->
</template>


<script lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonIcon,
  IonInput,
  IonRow,
  IonCol,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  // IonMenuToggle,
  // IonCardContent,
  IonImg,
  IonThumbnail
} from "@ionic/vue";
import { defineComponent} from "vue";
import { FieldType } from "@/components/Forms/BaseFormElements"
import { settings } from "ionicons/icons";
import { Field, Option } from "@/components/Forms/FieldInterface"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
// import "@capacitor-community/sqlite"
import ApiClient from "@/services/api_client"
import { isMobile } from 'mobile-device-detect';
import { toastWarning, toastSuccess } from "@/utils/Alerts"
export default defineComponent({
   name: "Home",
  components: {
    IonRow,
    IonCol,
    IonInput,
    IonContent,
    IonPage,
    IonButton, 
  },
  data: () => ({
    component: null as any,
    response: null as any,
    ipAddress: '' as any,
    port: '' as any,
    regexipAddress: /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    regexPort:/^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/,
  }),

  async created(){
    this.checkConfig();
  },
    watch: {
    '$route': {
        handler({query}: any) {
          if(query.name != undefined || query.name != 'undefined')
          this.component = query.name
          else
          this.component = 'false'
        },
        immediate: true,
        deep: true
    }
  },
 setup() {
    return {
      settings
    };
  },
  methods: {
    async submitSystemSetup() {
    
      if(this.regexipAddress.test(this.ipAddress) && this.regexPort.test(this.port))
      {
        const response = await ApiClient.loadConfig();
        if(this.component != "system-setup")
        {
          await ApiClient.addConfig(this.ipAddress,this.port).catch((error) => {
            console.log(error);
          });
          toastSuccess('Settings succesfully saved');
          this.$router.push("/login");
        }
        else
        if(response.values[0].apiURL != "" && this.component == "system-setup")
        {
          await ApiClient.updateConfig(this.ipAddress,this.port).catch((error) => {
          console.log(error);
          });
          toastSuccess('Settings succesfully saved');
          this.$router.push("/login");
        }
      }else
      {
        toastWarning('Wrong ip address and port');
      }
    },
    async checkConfig()
    {
       const response = await ApiClient.loadConfig();
      if(response.values[0].apiURL != "" && this.component != "system-setup")
      {
        this.$router.push("/login");
      }
    }
  },
})
</script>
<style scoped>

.get-centered {
  text-align: left;
}

.list {
  margin-bottom: 0;
}

.login_input, input{
  width: calc(100% - 10px);
  font-family: Nimbus Sans L, Arial Narrow, sans-serif;
  font-size: 1.2em;
  color: #525252;
  padding: 5px;
  margin-bottom: 5px;
  border: 1px solid #ccc;
  margin: 5px;
  margin-bottom: 30px;
  border-radius:5px ;
}

#container {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 45%;
  transform: translateY(-50%);
  border-radius: 9px;
  height: 75%;
  margin: 2%;
}

.loc-footer {
    height: 10% !important;
    background-color: #333 !important;
}

.footer-btns {
  margin-left: 1%;
  margin-top: 1%;
  height: 6vh;
}

 @media only screen and (max-width: 900px) {
   #container {
     top: 20%;
     height: 15%;
   }
 }

 #nextButton {
     float: right;
     margin-right: 5px;
 }

 #backButton {
     float: right;
     margin-right: 5px;
 }

.content-containers {
  visibility: hidden;
  top: 1%;
  position: inherit;
  width: 100%;
}

#page0 {
  visibility: visible;
}
.header-text {
    font-size: 27px;
    color: #7d7d7d;
    
}
.header-row{
text-align: center;
margin-top: 20px;
}

.item.md.in-list.ion-activatable.ion-focusable.hydrated.item-label.item-interactive.item-select {
    border: solid 1px #ccc;
     margin-bottom: 25px;
}
.bg-white.border.px-2.py-1{
    margin: 0px;
    height: 49px;
    margin-top: 0px;
    width: 100%;
    margin-bottom: 25px;
}
.alert-radio-group.sc-ion-alert-md {
    max-height: unset !important;
}
.md.in-item.hydrated {
  padding: 9px;
  font-size: 18px;
}
.item.md.in-list.ion-activatable.ion-focusable.hydrated.item-interactive.item-select.item-has-placeholder {
    border: 1px solid #ccc;
    margin-bottom: 25px;
}

.item.md.in-list.ion-activatable.ion-focusable.hydrated.item-interactive.item-select.item-has-placeholder:focus-within {
   outline: none !important;
    border: solid 2px #719ECE;
    box-shadow: 0 0 2px #202020;
}
.md.in-item.hydrated {
    width: 100%;
    padding: 0px !important;
}

.login_input:focus, input:focus, .login_input.sc-ion-input-md-h.sc-ion-input-md-s.md.hydrated:focus-within {
    outline: none !important;
    border: solid 2px #719ECE;
    box-shadow: 0 0 2px #202020;
}
.datePicker
{
  position: absolute;
  z-index: 1000;
  width: 75%;
  right: 0;
  top: 6px;

}
.ionCard{
  height: 450px;
}

.list-md {

    margin-left: 30%;
    margin-right: 30%;
}
</style>