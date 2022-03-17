<template>
     <!-- Start the pop up -->
      <ion-card class="ionic_card_scanner" id="generalModal" v-if="displayModal" >
        <ion-card-header style="border-bottom: 1px solid #c2c2c2;">
           <div class="alert-header">
            <span style="padding-top: 9px;">Patient Details</span>
          </div>
        </ion-card-header>
        <ion-card-content class="card-content" style="float: left; padding: 30px; width:100%">
          <ion-row ><b>Firstname :</b>  {{  firstname}}</ion-row>
          <ion-row ><b>Surname :</b>  {{  surname}}</ion-row>
          <ion-row ><b>Gender :</b>  {{  gender}}</ion-row>
          <ion-row ><b>Birthday :</b>  {{  birthday}}</ion-row>
          <ion-row ><b>District :</b>  {{  district}}</ion-row>
          <ion-row ><b>Patient ID :</b>  {{  patientID}}</ion-row>
          <ion-row ><b>Malawi National ID :</b>  {{  nationalID}}</ion-row>
          <ion-row ><b>Health Passport ID :</b>  {{  clientID}}</ion-row>
        </ion-card-content> 
        <ion-row class="cardfooter">
          <ion-col class="ionic_card_col">
              <div  @click="goHome()" style="color:red" >No</div>
              <div @click="openScreeningPage()" >Yes</div>
          </ion-col>
        </ion-row>
      </ion-card> 
    <!-- End the pop up -->
  <div v-if="displayModal" id="cover-page"></div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { Patientservice } from "@/services/patient_service"
import { AppInterface } from "@/apps/interfaces/AppInterface";
import { BarcodeScanner } from "@ionic-native/barcode-scanner";
import { toastWarning } from "@/utils/Alerts";

export default defineComponent({
  name: "Scanner",
  data() {
    return {
      app: {} as AppInterface,
      patientID: "",
      firstname: "",
      surname: "",
      gender: "",
      birthday: "",
      district: "",
      clientID: "",
      nationalID: "",
      malawiNationalID: [] as any,
      displayModal: false,
    };
  },
  async mounted() 
  {
    await BarcodeScanner.scan().then( async (barcodeData)=> {
      this.displayModal = true;
    if(barcodeData.text.length > 30) {
      this.malawiNationalID =barcodeData.text.split('<');
      this.malawiNationalID = this.malawiNationalID.at(-1).split('~');
      this.clientID = this.malawiNationalID[2];
      const data = await Patientservice.findByOtherID(28, this.clientID)
      
      if(data.length == 0) {
       
        this.surname = this.malawiNationalID[1];
        this.firstname = this.malawiNationalID[3].split(',')[0];
        this.gender = this.malawiNationalID[5];
        this.birthday = this.malawiNationalID[6];
        this.$router.push({
          name: "Triage Search client", //use name for router push
          params:  {
          firstname: this.firstname,
          surname:  this.surname   ,  
          gender:   this.gender      ,   
          birthday:   this.birthday     ,   
          malawiNationalID:  this.clientID
        }
        });
        toastWarning('Client Malawi National ID not found');
      }
      else 
      if (data.length == 1){
        this.opeMondal(data);
      }
    } 
    else
    {
      const data = await Patientservice.findByOtherID(3, barcodeData.text);
      if(data.length == 0) {
        toastWarning('Client not found');
        this.goHome();
      }
      else
      {
        this.opeMondal(data);
      }
    }

  }).catch(err => {
    console.log('Error', err);
    toastWarning('Fails to scan');
    this.goHome();
    // alert('Error'+ JSON.stringify(err));
  });
  },
  methods: {
    async opeMondal(data: any) {
      if(data[0].person.names[0].given_name)     
        this.firstname = data[0].person.names[0].given_name;

      if(data[0].person.names[0].family_name)
        this.surname = data[0].person.names[0].family_name;

      if(data[0].person.gender)
        this.gender = data[0].person.gender;

      if(data[0].person.birthdate)
        this.birthday = new Date(data[0].person.birthdate).toString().replace(/\S+\s(\S+)\s(\d+)\s(\d+)\s.*/,'$2/$1/$3');

      if(data[0].patient_id)
        this.patientID =data[0].patient_id;

     
         
        const identfier2 =data[0].patient_identifiers.filter(function (el: any){
          return el.identifier_type == 3;
        });
        this.clientID = identfier2[0].identifier;
      
        // this.clientID = data[0].patient_identifiers[0].identifier;

      if(data[0].person.addresses[0].address2)
        this.district = data[0].person.addresses[0].address2;

    
        const identfier =data[0].patient_identifiers.filter(function (el: any){
          return el.identifier_type == 28;
        });
        this.nationalID = identfier[0].identifier;

    },
    async goHome() {
      this.$router.push('/triage');
    },
    async openScreeningPage() {
        this.$router.push({
          name: "Screen Patient", //use name for router push
          params:  {
          'patient_id': this.patientID,
          'encounterID':'unknown'
        }
        });
    },
  }
});
</script>

<style scoped>
.alert-header{
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  color: rgb(12, 12, 12);
  display: flex;
  justify-content: center;
}
.cardfooter{
            width: 100%;
border-top: solid 1px #c2c2c2;
          }
.card-content {
  padding-top: 13px;
padding-bottom: 30px;
flex: 1;
flex: 1;
color: var(--ion-color-step-850, #262626);
font-size: 20px;
text-overflow: ellipsis;
white-space: nowrap;
overflow: hidden;
font-weight: normal;
min-height: 100px;
  height: auto;
overflow:scroll;
max-height: 700px;
}
</style>

<style >

#cover-page
{
 background-color: #202020;
z-index: 100;
height: 100%;
width: 100%;
position: absolute;
opacity: 0.5;
}

.ionic_card_scanner{
  width: 700px;  position: absolute;
z-index: 1100;
margin-left: auto;
margin-right: auto;
left: 0;
right: 0;
max-height: 95%;
margin-top: 50px;
}
.ionic_card_col {
          display: flex;
justify-content: space-between;
padding: 14px;
font-size: 17px;
color: var(--ion-color-primary, #3880ff);
font-weight: 500;
text-align: end;
text-transform: uppercase;
        }


</style>