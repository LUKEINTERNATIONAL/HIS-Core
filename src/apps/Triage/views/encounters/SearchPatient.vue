<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-row>
          <ion-col>
            <ion-text>
              <span class="header-text" >
             Find Patient
              </span>
            </ion-text>
          </ion-col>
        </ion-row>
      </ion-toolbar>
    </ion-header>
   
    <ion-content class="ion-padding" >
     
      <ion-row>
        <ion-col>
          <form novalidate>
            <ion-list>
              <ion-row>
                <div class="input-lable">
                  <label>Firstname</label>
                <ion-input
                  v-model="firstname"
                  name="Firstname"
                  ref="Firstname"
                  type="text"
                  spellcheck="false"
                  autocapitalize="off"
                  required
                  class="login_input"
                  placeholder="Firstname"
                >
                </ion-input>
                </div>
                <div class="input-lable">
                  <label>Lastname</label>
                <ion-input
                  ref="Surname"
                  v-model="surname"
                  name="Surname"
                  type="text"
                  required
                  placeholder="Surname"
                  class="login_input"
                >
                </ion-input>
                </div>
          
                <label style="margin-top: 23px;">
                  <input :disabled="disableGender" v-model="gender" type="radio" name="gender" id="radio11" :value="'M'" />
                  <label for="radio11">Male</label>
                  <input :disabled="disableGender" v-model="gender" type="radio" name="gender" id="radio12" :value="'F'"/>
                  <label for="radio12">Female</label>
                </label>
              </ion-row>
        
            </ion-list>
          </form>
        </ion-col>
      </ion-row>
      <ion-row>
      <table  v-if="items">
        <tr v-for="item in items" v-bind:key="item.label">
          <td @click="openScreeningPage(item.value)">{{item.label}}</td>
        </tr>
      </table>
      <table  v-if="firstnames && !gender" >
        <tr v-for="item in firstnames" v-bind:key="item">
          <td @click="setFirstnames(item)">{{item}}</td>
        </tr>
      </table> 
      <table  v-if="surnames && !gender">
        <tr v-for="item in surnames" v-bind:key="item">
          <td @click="setSurnames(item)">{{item}}</td>
        </tr>
      </table>
    </ion-row>
 </ion-content>
  <his-footer :btns="btns" />
</ion-page>
</template>

<script lang="ts">
import {
  IonContent,
  IonInput,
  IonList,
  IonRow,
  IonCol,
  IonText,
  IonToolbar,
  IonHeader,
  IonPage,
  toastController
} from "@ionic/vue";
import { defineComponent, ref } from "vue";
import { Patientservice } from "@/apps/Triage/services/patient_service";
import { Patient } from "@/interfaces/patient";
import { PersonService } from "@/services/person_service"

import HisFooter from "@/components/HisDynamicNavFooter.vue";
import { alertConfirmation } from "@/utils/Alerts";
import { NavBtnInterface } from "@/components/HisDynamicNavFooterInterface";


export default defineComponent({
  name: "Home",
  components: {
    IonList,
    IonRow,
    IonCol,
    IonInput,
    IonContent,
    IonPage,
    IonText,
    IonToolbar,
    IonHeader, 
    HisFooter   
  },
  data: () => ({
      passedKey:"",
      scannedIDStatus: false,
      firstname: "" as any,
      surname: "" as any,
      gender: "" as any,
      active: "",
      busy: false,
      submitted: false,
      disableGender: true,
      displayName: false,
      displayFirstname: true,
      displaySurname: true,
      birthday: "" as any,
      clientID: "" as any,
      currentHeight: null,

      patientName: '',
      birthDate: '',
      getGender: '',
      District: '',
      items: Boolean as any,
      firstnames: Boolean as any,
      surnames:  Boolean as any,
      btns: [] as Array<NavBtnInterface>,

  }),
   mounted(){
    this.btns.push(this.getCancelBtn())
    this.btns.push(this.getClearBtn())
    this.btns.push(this.getNewPatientBtn())

    const data = this.$route.params;
    if(data.firstname != 'undefined' && data.surname != 'undefined')
     this.scannedIDStatus = true;
    if(data.firstname != 'undefined')
      this.firstname = data.firstname;
    if(data.surname != 'undefined')
      this.surname = data.surname;
    if(data.birthday != 'undefined')
      this.birthday = data.birthday;
    if(data.malawiNationalID != 'undefined')
      this.clientID = data.malawiNationalID;

    if(data.gender == 'Male')
      this.gender = 'M'
    if(data.gender == 'Female')
      this.gender = 'F'
  },
watch : {
  firstname:function(val) {
    this.firstname = val;
    this.firstnames = true;
    this.surnames =false;
    this.items =false;
    this.activateGender();
    if(!this.scannedIDStatus)
    this.searchGivenName();
  },
   surname:function(val) {
    this.surname = val;
    this.surnames =true;
    this.firstnames = false;
    this.items =false;
    this.activateGender();
    if(!this.scannedIDStatus)
    this.searchFamilyName();
  },
  gender:function(val) {
    this.items =true;
    this.surnames =false;
    this.firstnames = false;
    this.setValues();
  }
 },
  methods: {
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
     getNewPatientBtn(): NavBtnInterface {
      return {
        name: "New Patient",
        color: "success",
        size: "large",
        slot: "end",
        visible: true,
        onClick: async () => {
          return this.registartPatient();
        }
      }
    },
     getClearBtn(): NavBtnInterface {
      return {
        name: "Clear",
        color: "primary",
        size: "large",
        slot: "end",
        visible: true,
        onClick: async () => {
          return this.clearInputField();
        }
      }
    },
    clearInputField(){
      this.gender = "";
      this.firstname = "";
      this.surname = "";
    },
    activateGender()
    {
      if(this.gender && this.firstname && this.surname)
        this.setValues();
      else
      if(this.firstname && this.surname)
      this.disableGender = false;
      else
      {
        this.gender = false;
        this.disableGender = true;
      }
    },
    async searchGivenName() 
    {
      const patientGivenName = await PersonService.searchGivenName(this.firstname);
      this.firstnames = patientGivenName;
    },
     async searchFamilyName() 
    {
      const patientFamilyName = await PersonService.searchFamilyName(this.surname);
      this.surnames = patientFamilyName;
    },
      async fetchResults(gname: string, fname: string, gender: string) {
      const patients = await Patientservice.search({
        'given_name': gname, 'family_name': fname, gender
      });
      return patients.map((item: Patient) => {
        const patient = new Patientservice(item);
        return {
          label: patient.getTriagePatientInfoString(),
          value: patient.getID(),
          other: patient,
        };
      });
    },
    setFirstnames(firstname: string){
      this.firstname = firstname;
    },
     setSurnames(surname: string){
       this.surname =surname;
       
    },
   async setValues() {

       const results = await this.fetchResults(
          this.firstname,
          this.surname,
          this.gender
        );

console.log(results);
        this.items = results;
     
    },
    registartPatient()
    {
      let firstname = 'undefined';
      let surname = 'undefined';
      let gender = 'undefined';
      let birthday = 'undefined';
      let malawiNationalID = 'undefined';
      if(this.firstname)
        firstname = this.firstname;
      if(this.surname)
        surname =  this.surname;
      if(this.gender)
        gender =   this.gender;
      if(this.birthday)
        birthday =   this.birthday;
      if(this.clientID)
        malawiNationalID =  this.clientID;
      this.$router.push({
          name: "Triage Patient Registration", //use name for router push
          params:  {
          firstname: firstname,
          surname:  surname,  
          gender:   gender,   
          birthday:   birthday,   
          malawiNationalID:  malawiNationalID
        }
      });
    }
    ,
    openScreeningPage(id: number) {
      const params ={ name: "Screen Patient", params: { 'patient_id': id, 'encounterID':'unknown'}} 
      this.$router.push(params)
    },
     goHome() {
     this.$router.push('/triage');
  
    },
    doLogin: async function () {
      console.log("doLogin");
      this.busy = true;
      const data = this.$route.params;
      this.busy = false;
    },
  },
  onLogin(ev: any) {
    ev.preventDefault();
  },
});
</script>

<style scoped>
ion-footer {
  background-color: white;
}
ion-input {
  margin: 5%;
}
#container {
  text-align: center;

  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}
#coat {
  float: left;
}

#pepfar {
  float: right;
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

.main {
  display: table;
  width: 100%;
  border: 1px solid black;
  height: 97vh;
}


.logos img {
  width: 90px;
  height: 90px;
  margin-left: 10px;
  float: left;
}

.login-logo img {
  max-width: 150px;
}

.list {
  margin-bottom: 0;
}

#emr-title {
  font-size: 60px;
  font-weight: bold;
  color: #bdb5aa;
  padding-bottom: 8px;
  text-shadow: 0 2px 0 rgba(255, 255, 255, 0.8);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
  /* text-transform: uppercase; */
}

#emr-title-one {
  color: #8b4513;
}

#emr-title-two {
  color: #cd853f;
}

#version-desc {
  font-size: 15px;
  margin-left: 5px;
}

.login_input {
  border: 1px solid #ccc;
  width: calc(100% - 10px);
  font-family: Nimbus Sans L, Arial Narrow, sans-serif;
  font-size: 1.3em;
  color: #000;
  padding: 5px;
  margin-bottom: 5px;
  border: 1px solid gray;
   margin: 5px;
   margin-top: 3%;
margin-bottom: 3%;
}

#container {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 45%;
  transform: translateY(-50%);
  /*background-color: #F0F0F0;
  border-style: solid;
  border-width: 1px;*/
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
  height: 60px;
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
}

tr:hover {
    box-shadow: inset 1px 0 0 #dadce0,inset -1px 0 0 #dadce0,0 1px 2px 0 rgba(60,64,67,.3),0 1px 3px 1px rgba(60,64,67,.15);
    z-index: 2;
}
tr:nth-child(even) {
  background-color: #dddddd;
}
.header-text {
    font-size: 25px;
    font-weight: bold;
    color: #7d7d7d;
}


*,
*:before,
*:after {
  box-sizing: border-box;
}

input[type="radio"] {
  display: none;
}

input[type="radio"]+label:before {
   content: "";
  /* create custom radiobutton appearance */
  display: inline-block;
  width: 35px;
  height: 35px;
  padding: 3px;
  margin-right: 3px;
  /* background-color only for content */
  background-clip: content-box;
  border: 2px solid #bbbbbb;
  background-color: #e7e6e7;
  border-radius: 50%;
}

/* appearance for checked radiobutton */
input[type="radio"]:checked + label:before {
    background-color: #42d77d;
  border: 2px solid #42d77d;
}

/* optional styles, I'm using this for centering radiobuttons */
label {
  display: flex;
  align-items: center;
  width:200px;
}
.login_input:focus, input:focus, .login_input.sc-ion-input-md-h.sc-ion-input-md-s.md.hydrated:focus-within {
    outline: none !important;
    border: solid 2px #719ECE;
    box-shadow: 0 0 2px #202020;
}
label{
  margin-left: 6px;
  font-size: 20px;
font-weight: 500;
color: #666;
}
.input-lable {
  width: 35%;
}
</style>