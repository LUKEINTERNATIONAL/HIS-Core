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
        <ion-content :fullscreen="true" style="background-color:red;">
        <div id="container" class="his-card overview" >
             <form novalidate class="search-field">
          <div class="input-lable start-date">
            <label>Start Date*</label>
            <birth-datepicker 
            @input="startDate = new Date($event).toISOString().slice(0, 10)" 
            delimiter="-" 
            yearFirst='true' 
            minYear="2000"
            :value = "valueDate"
            attachment = "right"
            name="startDate"
            ref="startDate"
            type="text"
            spellcheck="false"
            autocapitalize="off"
            required
            class="login_input"
            placeholder="Enter Start Date"
            />
          </div>
          <div class="input-lable end-date">
            <label>End Date*</label>
            <birth-datepicker 
            ref="endDate"
            @input="endDate = new Date($event).toISOString().slice(0, 10)" 
            attachment = "right"
            delimiter="-" 
            yearFirst='true' 
            minYear="2000"
            name="endDate"
            type="text"
            required
            placeholder="Enter End Date"
            class="login_input"
            :disabled="dissableEndDate"
            />
          </div>
        </form>
            <ion-row class="" v-if="viewReport">
              <span style="font-size:20px;"><b>Facility:</b> {{locationName }}</span>
                <h3> Covid-19 Triage Report</h3>
                <table id="my-table" border="1">
                  <tr style="background:#000000;"> 
                    <th>Conditions</th>
                    <th>Male</th>
                    <th>Female</th>
                    <th>Total</th>
                  </tr>
                  <tr class="">
                      <td >Fever or Chills</td>
                      <td >{{totalFeverMale}}</td>
                      <td >{{totalFeverFemale}}</td>
                      <td >{{totalFever}}</td>
                  </tr>
                  <tr class="">
                      <td >Cough for any Duration</td>
                      <td >{{totalCoughMale}}</td>
                      <td >{{totalCoughFemale}}</td>
                      <td >{{totalCough}}</td>
                  </tr>
                  <tr class="">
                      <td >Difficulty Breathing</td>
                      <td >{{totalDifficultyBreathingMale}}</td>
                      <td >{{totalDifficultyBreathingFemale}}</td>
                      <td >{{totalDifficultyBreathing}}</td>
                  </tr>
                  <tr class="">
                      <td >Loss of taste and/or smell</td>
                      <td >{{totalLossTasteMale}}</td>
                      <td >{{totalLossTasteFemale}}</td>
                      <td >{{totalLossTaste}}</td>
                  </tr>
                  <tr class="">
                      <td >History of COVID-19 Contact</td>
                      <td >{{totalHistoryCovidMale}}</td>
                      <td >{{totalHistoryCovidFemale}}</td>
                      <td >{{totalHistoryCovid}}</td>
                  </tr>
                  <tr class="">
                      <td >Fatigue</td>
                      <td >{{totalFatigueMale}}</td>
                      <td >{{totalFatigueFemale}}</td>
                      <td >{{totalFatigue}}</td>
                  </tr>
                  <tr class="">
                      <td >Shortness of Breath</td>
                      <td >{{totalShortnessBreathMale}}</td>
                      <td >{{totalShortnessBreathFemale}}</td>
                      <td >{{totalShortnessBreath}}</td>
                  </tr>
                  <tr class="">
                      <td >Diarrhea</td>
                      <td >{{totalDiarrheaMale}}</td>
                      <td >{{totalDiarrheaFemale}}</td>
                      <td >{{totalDiarrhea}}</td>
                  </tr>
                  <tr class="">
                      <td >Nausea or vomiting</td>
                      <td >{{totalVomitingMale}}</td>
                      <td >{{totalVomitingFemale}}</td>
                      <td >{{totalVomiting}}</td>
                  </tr>
                  <tr class="">
                      <td >Muscle or body pains aches</td>
                      <td >{{totalMusclePainsMale}}</td>
                      <td >{{totalMusclePainsFemale}}</td>
                      <td >{{totalMusclePains}}</td>
                  </tr>
                  <tr class="">
                      <td >Sore throat</td>
                      <td >{{totalSoreTroatMale}}</td>
                      <td >{{totalSoreTroatFemale}}</td>
                      <td >{{totalSoreTroat}}</td>
                  </tr>
                   <tr class="">
                      <td > </td>
                      <td >{{totalMale}}</td>
                      <td >{{totalFemale}}</td>
                      <td >{{totalPatient}}</td>
                  </tr>
                </table>
            </ion-row>
          </div>
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
  IonButton,
  toastController,
  loadingController
} from "@ionic/vue";
import { defineComponent, ref } from "vue";
import { toastWarning } from "@/utils/Alerts"
import ApiClient from "@/services/api_client"
import { Patientservice } from "@/services/patient_service";
import { Patient } from "@/interfaces/patient";
import { PersonService } from "@/services/person_service"
import { ObservationService } from "@/services/observation_service"
import dayjs from "dayjs";
import LinkConfiguration from "@/views/LinkConfiguration.vue"
import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { LocationService } from "@/services/location_service";
import birthDatepicker from 'vue-birth-datepicker/src/birth-datepicker'
import HisFooter from "@/components/HisDynamicNavFooter.vue";
import { alertConfirmation } from "@/utils/Alerts";
import { NavBtnInterface } from "@/components/HisDynamicNavFooterInterface";

export default defineComponent({
  // emits: ['input-char'],
  name: "Home",
  components: {
    IonRow,
    IonCol,
    IonContent,
    IonPage,
    IonText,
    IonToolbar,
    IonHeader,
    birthDatepicker,
    HisFooter
    
  },
  data: () => ({
    dayjs,
    dissableEndDate: true,
    startDate: "" as any,
    endDate: "" as any,
    totalPatient: 0,
    totalFemale: 0,
    totalMale: 0,

    totalFever : 0,
    totalFeverMale : 0,
    totalFeverFemale : 0,
    totalCough : 0,
    totalCoughMale : 0,
    totalCoughFemale : 0,
    totalDifficultyBreathing : 0,
    totalDifficultyBreathingMale : 0,
    totalDifficultyBreathingFemale : 0,
    totalLossTaste : 0,
    totalLossTasteMale : 0,
    totalLossTasteFemale : 0,
    totalHistoryCovid : 0,
    totalHistoryCovidMale : 0,
    totalHistoryCovidFemale : 0,
    totalFatigue : 0,
    totalFatigueMale : 0,
    totalFatigueFemale : 0,
    totalShortnessBreath : 0,
    totalShortnessBreathMale : 0,
    totalShortnessBreathFemale : 0,
    totalDiarrhea : 0,
    totalDiarrheaMale : 0,
    totalDiarrheaFemale : 0,
    totalVomiting : 0,
    totalVomitingMale : 0,
    totalVomitingFemale : 0,
    totalMusclePains : 0,
    totalMusclePainsMale : 0,
    totalMusclePainsFemale : 0,
    totalSoreTroat : 0,
    totalSoreTroatMale : 0,
    totalSoreTroatFemale : 0,

    facilityName: "" as any,
    locationName: "" as any,
    conceptID: "" as any,
    personID: "" as any,
    viewReport: false,
    loader: "" as any,
    btns: [] as Array<NavBtnInterface>,
  }),
  mounted(){
    this.btns.push(this.getCancelBtn())
    this.btns.push(this.getClearBtn())
    this.btns.push(this.getDownloadBtn())
    this.locationName = sessionStorage.locationName;
  },
   watch:{
    endDate:function() {
      this.viewReport = true;
      this.presentLoading().then( async ()=>{
       await this.fetchResults().then(()=>{
        this.dismissed(); 
        })
      }) 
    },  
    startDate:function(){
      this.dissableEndDate = false;
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
     getDownloadBtn(): NavBtnInterface {
      return {
        name: "Download PDF",
        color: "success",
        size: "large",
        slot: "end",
        visible: true,
        onClick: async () => {
          return this.printPDF();
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
      this.startDate = "";
      this.endDate = "";
      location.reload();
    },
   async dismissed(){
      this.loader.dismiss();
   },
    async fetchResults() {
      this.startDate = this.dayjs(this.startDate).format("YYYY-MM-DD");
      this.endDate = this.dayjs(this.endDate).format("YYYY-MM-DD");
      await ObservationService.getObs({
          'concept_id': '10539',
          'start_date': this.startDate,
          'end_date': this.endDate,
          'page_size': 50000
      }).then(async (data: any) => {
         await this.getPatientData(data)
        }
      );
    },
    async fetchObs(conceptID: any,valueText: any) {
      this.startDate = this.dayjs(this.startDate).format("YYYY-MM-DD");
      this.endDate = this.dayjs(this.endDate).format("YYYY-MM-DD");
      let count = 0;
      await ObservationService.getObs({
          'concept_id': conceptID,
          'person_id': this.personID,
          'start_date': this.startDate,
          'end_date': this.endDate,
          'page_size': 1
      }).then(async (data: any) => {

        console.log(data[0]);
        try {
           if(data[0].value_text == valueText)
        console.log("fsdfsdf"+JSON.stringify(data[0].value_text));
          // return data;
          count = data.length;
        } catch (error) {
          console.log('')
        }
       
          
          // console.log(count)
        }
      );
      return count;
    },
   async getPatientData(data: any){
      const totalFemaleArray = [];
      const totalMaleArray = [];

      let obs;

      for(const x in data){
        this.totalPatient = data.length;
        this.personID = data[x].person_id;
        const patientData = await Patientservice.findByID(data[x].person_id)
        const patient = new Patientservice(patientData)
        const gender =patient.getGender();

        obs =this.fetchObs("5945",'No other symptom');
        if(await obs == 1){
          if(gender == 'M')
            this.totalFeverMale++;
          else if (gender == 'F')
            this.totalFeverFemale++;

          this.totalFever++
        }

        obs =this.fetchObs("7644",'Cough');
        if(await obs == 1){

          if(gender == 'M')
            this.totalCoughMale++;
          else if (gender == 'F')
            this.totalCoughFemale++;

          this.totalCough++
        }

        obs =this.fetchObs("7411",'Difficulty breathing');
        if(await obs == 1){

          if(gender == 'M')
            this.totalDifficultyBreathingMale++;
          else if (gender == 'F')
            this.totalDifficultyBreathingFemale++;

          this.totalDifficultyBreathing++
        }

        obs =this.fetchObs("5945",'Loss of taste or smell');
        if(await obs == 1){

          if(gender == 'M')
            this.totalLossTasteMale++;
          else if (gender == 'F')
            this.totalLossTasteFemale++;

          this.totalLossTaste++
        }

        obs =this.fetchObs("5945",'Fatigue');
        if(await obs == 1){

          if(gender == 'M')
            this.totalHistoryCovidMale++;
          else if (gender == 'F')
            this.totalHistoryCovidFemale++;

          this.totalHistoryCovid++
        }
        
        obs =this.fetchObs("5945",'Fatigue');
        if(await obs == 1){

          if(gender == 'M')
            this.totalFatigueMale++;
          else if (gender == 'F')
            this.totalFatigueFemale++;

          this.totalFatigue++
        }

        obs =this.fetchObs("5945",'Shortness of breath');
        if(await obs == 1){

          if(gender == 'M')
            this.totalShortnessBreathMale++;
          else if (gender == 'F')
            this.totalShortnessBreathFemale++;

          this.totalShortnessBreath++;
        }

        obs =this.fetchObs("5945",'Diarrhea');
        if(await obs == 1){

          if(gender == 'M')
            this.totalDiarrheaMale++;
          else if (gender == 'F')
            this.totalDiarrheaFemale++;

          this.totalDiarrhea++
        }

        obs =this.fetchObs("5945",'Vomiting');
        if(await obs == 1){

          if(gender == 'M')
            this.totalVomitingMale++;
          else if (gender == 'F')
            this.totalVomitingFemale++;

          this.totalVomiting++
        }

        obs =this.fetchObs("5945",'Generalised body Pains');
        if(await obs == 1){

          if(gender == 'M')
            this.totalMusclePainsMale++;
          else if (gender == 'F')
            this.totalMusclePainsFemale++;

          this.totalMusclePains++;
        }

        obs =this.fetchObs("5945",'Sore throat');
        if(await obs == 1){

          if(gender == 'M')
            this.totalSoreTroatMale++;
          else if (gender == 'F')
            this.totalSoreTroatFemale++;

          this.totalSoreTroat++;
        }

        if(gender == 'M')
          totalMaleArray.push(data[x].person_id);
        else if (gender == 'F')
          totalFemaleArray.push(data[x].person_id);
      }

      this.totalMale = totalMaleArray.length;
      this.totalFemale = totalFemaleArray.length;

    },
     goHome() {
     this.$router.push('/triage');
  
    },
    async printPDF(){
      const reportTitle = this.locationName +" Triage Report (From "+ this.dayjs(this.startDate).format("DD-MMM-YYYY")+ " To " +this.dayjs(this.endDate).format(" DD-MMM-YYYY") +" )";
      const doc = new jsPDF();
      const title = doc.splitTextToSize(reportTitle, 180)
      const tableMarginStartY = title.length <= 1 ? 20 : title.length * 10
      doc.text(title, 14, 10)
      autoTable(doc, { startY: tableMarginStartY, styles: { cellPadding: 5,fontSize: 13,lineWidth: 0.5 },html: '#my-table' })
      doc.save(reportTitle+'.pdf')
    },
    async presentLoading() {
      this.loader = await loadingController
        .create({
          message: 'Please wait...',
          backdropDismiss: true,
        })
      await this.loader.present()
    }
   
  }

});
</script>
<style scoped>
.his-card{
  --ion-background-color: #fff;
  position: relative !important;
  top: 48% !important;
  border-radius: 5px !important;
  height: 95% !important;
  overflow:scroll;
  /* width: 20%; */
  }
ion-content{

    --ion-background-color:#e0e0e0;
}
h3{
  width: 100%;
  text-align: center;
}
  .search-field{
          display: flex;
          justify-content: right;
        }
.search-btn{
  height: 47px;
}
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
  /*background-image: url("/assets/images/login-logos/Malawi-Coat_of_arms_of_arms.png");
  background-repeat: no-repeat;
  background-position: center;*/
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



.login_input {
  border: 1px solid #ccc;
  width: 90%;
  font-family: Nimbus Sans L, Arial Narrow, sans-serif;
  font-size: 1.1em;
  color: #000;
  padding: 3px;
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
  border: 1px solid #dddddd;
  box-shadow: inset 0 -1px 0 0 rgba(100,121,143,0.122);
  text-align: left;
  background: rgba(242,245,245,0.8);
  padding: 20px;

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
  /* width: 35px; */
  height: 30px;
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
  /* width:200px; */
}
.login_input:focus, input:focus, .login_input.sc-ion-input-md-h.sc-ion-input-md-s.md.hydrated:focus-within {
    outline: none !important;
    border: solid 2px #719ECE;
    box-shadow: 0 0 2px #202020;
}
label{
  margin-left: 5%;
  font-size: 20px;
font-weight: 500;
color: #666;
}
.input-lable {
  width: 50%;
}
</style>
<style>
.start-date .birthday-picker_dropdown.attach-right {
  right: -43.5vw;
}
.end-date .birthday-picker_dropdown.attach-right {
  right: -1vw;
}
</style>