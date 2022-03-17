<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-row>
          <ion-col>
            <ion-text>
              <span class="header-text ">
                Register Patient
              </span>
            </ion-text>
          </ion-col>
        </ion-row>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" :fullscreen="true">
      <ion-row>
        <ion-col>
          <form novalidate>
            <ion-list  lines="none" class="get-centered">
              <ion-row>
                <div class="input-lable">
                  <label>Firstname</label>
                  <ion-input
                    v-model="firstname"
                    name="firstname"
                    ref="firstname"
                    type="text"
                    spellcheck="false"
                    autocapitalize="off"
                    required
                    class="input_fileds"
                    placeholder="Firstname*"
                    @ionInput="validateName"
                    @ionBlur="validateName"
                  >
                  </ion-input>
                </div>
                 <div class="input-lable">
                <label>Lastname</label>
                <ion-input
                  ref="lastname"
                  v-model="lastname"
                  name="lastname"
                  type="text"
                  required
                  placeholder="Lastname*"
                  class="input_fileds"
                  @ionInput="validateName"
                  @ionBlur="validateName"
                >
                </ion-input>
                 </div>
              </ion-row>
              <ion-row > 
                <div class="input-lable">
                  <label>Gender</label>
              <ion-col>
                <!-- <ion-item >
                  <ion-select @ionChange="setGender" v-model="gender"  :value="gender" interface="alert" :interface-options="customPopoverOptions" placeholder="Gender*" >
                    <ion-select-option value='M' >Male</ion-select-option>
                    <ion-select-option value="F"  >Female</ion-select-option>
                  </ion-select>
                </ion-item> -->
                <select v-model="gender" class="gender input_fileds"  required>
                  <option value="" class="genderPlaceHolder" disabled selected hidden style="color:gray">Gender*</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </ion-col>
                </div>
            <div class="input-lable">
              <label>National ID</label>
              <ion-input
                  ref="nationalID"
                  v-model="nationalID"
                  name="nationalID"
                  type="text"
                  placeholder="National ID"
                  class="input_fileds"
                >
                </ion-input>
              </div>
              </ion-row>
              <ion-row>
                <div class="input-lable">
                  <label>Birthday (YYYY-MM-DD)</label>
                 <ion-col>
                  <birth-datepicker 
                  class="input_fileds" 
                  @input="birthDate = new Date($event).toISOString().slice(0, 10)" 
                  @click ="dateLoopBreaker=false"
                  delimiter="-" 
                  yearFirst='true' 
                  minYear="1820"
                  :value = "valueDate"
                  valueIsString='true'
                  placeholder="Birthday (YYYY-MM-DD)*" />
                </ion-col>
                </div>
                <div class="input-lable">
                  <label>Age Estimate</label>
                <ion-input 
                  ref="Estimated age"
                  v-model="estimatedAge"
                  name="Estimated age"
                  type="tel"
                  required
                  placeholder="Age Estimate*"
                  class="input_fileds"
                  maxlength="3"
                  @click ="dateLoopBreaker=true"
                 >
                </ion-input>
                </div>
                </ion-row>
                <ion-row>
                  <div class="input-lable">
                  <label>District</label>
                  <ion-input 
                  :class="'dropdown'"
                  ref="District"
                  v-model="currentDistrict"
                  name="District"
                  type="text"
                  required
                  placeholder="Current District*"
                  class="input_fileds"
                  maxlength="3"
                   @click="getAllDistricts('currentDistrict')"
                 >
             
                </ion-input>
                  </div>
                  <div class="input-lable">
                  <label>Current TA</label>
                  <ion-input
                    :class="'dropdown'"
                    :disabled="disableCurrentlyTA"
                    ref="currentTA"
                    v-model="currentTA"
                    name="currentTA"
                    type="text"
                    required
                    placeholder="Current TA*"
                    @click="getDisplayTA('currentTA')"
                    class="input_fileds">
                  </ion-input> 
                  </div>
                </ion-row>
                <ion-row>
                  <div class="input-lable">
                  <label>Current Village</label>
                   <ion-input
                    :class="'dropdown'"
                    :disabled="disableCurrentlyVillage"
                    ref="Current Village"
                    v-model="currentVillage"
                    name="currentVillage"
                    type="text"
                    required
                    placeholder="Current Village*"
                    @click="getDisplayVillage('currentVillage')"
                    class="input_fileds">
                  </ion-input>
                  </div>
                  <div class="input-lable">
                  <label>Home District</label>
                  <ion-input 
                  :class="'dropdown'"
                  ref="District"
                  v-model="homeDistrict"
                  name="District"
                  type="text"
                  required
                  placeholder="Home District*"
                  class="input_fileds"
                  maxlength="3"
                   @click="getAllDistricts('homeDistrict')"
                 >
                </ion-input>
                  </div>
                </ion-row>
                <ion-row>
                  <div class="input-lable">
                  <label>Home TA</label>
                  <ion-input
                    :class="'dropdown'"
                    :disabled="disableHomeTA"
                    ref="Home TA"
                    v-model="homeTA"
                    name="Home TA"
                    type="text"
                    required
                    placeholder="Home TA*"
                    @click="getDisplayTA('homeTA')"
                    class="input_fileds">
                  </ion-input>
                  </div>
                  <div class="input-lable">
                  <label>Home Village</label>
                   <ion-input
                    :class="'dropdown'"
                    :disabled="disableHomeVillage"
                    ref="Home Village"
                    v-model="homeVillage"
                    name="Residential Adress"
                    type="text"
                    required
                    placeholder="Home Village*"
                    @click="getDisplayVillage('homeVillage')"
                    class="input_fileds">
                  </ion-input> 
                  </div>
                </ion-row>
                <ion-row>
                  <div class="input-lable">
                  <label>Cell phone number</label>
                  <ion-input
                  ref="Cell phone number"
                  v-model="phone"
                  name="Cell phone number"
                  type="tel"
                  required
                  placeholder="Cell phone number"
                  class="input_fileds">
                  </ion-input> 
                  </div>
                  <div class="input-lable">
                  <label>Closest Landmark or Plot Number</label>
                    <ion-input
                    :class="'dropdown'"
                    ref="Closest Landmark or Plot Number"
                    v-model="landmark"
                    name="Closest Landmark or Plot Number"
                    type="text"
                    required
                    placeholder="Closest Landmark or Plot Number*"
                    @click=" getClosestLandMark('closestMark')"
                    class="input_fileds">
                  </ion-input> 
                  </div>
                </ion-row>
              </ion-list>
            </form>
          </ion-col>
        </ion-row>
      </ion-content>
      <!-- <ion-footer :translucent = "true" class="loc-footer">
        <ion-button class="footer-btns" @click="goHome" color="danger">Cancel</ion-button>
        <ion-button class="footer-btns" @click="onSave" id ="nextButton" color="success">Save</ion-button>
        <ion-button class="footer-btns" @click="clearField" id="backButton" color="primary">Clear</ion-button>
      </ion-footer> -->
      <his-footer :btns="btns" />
  </ion-page>
  
  
<modal 
  @toggle-modal="modalController" 
  @setModalValue="setModalValue($event)" 
  @addTA="addTA()" 
  @addVillage="addVillage()" 
  @addClosestLandMark="addClosestLandMark()" 
  :placeholder="placeholder" 
  :modalData="modalData" 
  v-if="isVisible" 
  :propModalValue="modalValue" 
  :additionalFunction="addFunction"
/>
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
  alertController
} from "@ionic/vue";
import { defineComponent, ref } from "vue";
import {LocationService} from "@/services/location_service"
import { DatePicker } from 'v-calendar';
import { toastWarning, toastSuccess,alertConfirmation } from "@/utils/Alerts";
import { search } from "ionicons/icons";
import {PersonService, NewPerson} from "@/services/person_service"
import {Patientservice} from "@/apps/Triage/services/patient_service"
import {Person} from "@/interfaces/person"
import { ProgramService } from "@/services/program_service";
import ApiClient from "@/services/api_client";
import birthDatepicker from 'vue-birth-datepicker/src/birth-datepicker'
import modal from '../../Components/modal.vue'
import { Service } from "@/services/service";
import { NavBtnInterface } from "@/components/HisDynamicNavFooterInterface";
import HisFooter from "@/components/HisDynamicNavFooter.vue";

export default defineComponent({
  name: "Home",
  components: {
    // DatePicker,
    IonList,
    IonRow,
    IonCol,
    IonInput,
    IonContent,
    IonPage,
    IonText,
    IonToolbar,
    IonHeader,
    birthDatepicker,
    modal,
    HisFooter
  },

 data: () => ({
  toggle: false,
  dateLoopBreaker: false,
  isVisible: false,
  valueDate: '',
  alertHeader:"",
  addFunction:"",
  firstname: "" as any,
  modalValue: "" as any,
  modalType: "" as any,
  placeholder: "" as any,
  searchDistrictValue: "" as any,
  searchValue: "" as any,
  lastname: "" as any,
  gender:"" as any,
  nationalID: "" as any,
  birthDate: '' as any,
  estimatedAge: '' as any,
  currentDistrict: '',
  districts: '',
  homeDistrict: '',
  currentTA: '',
  homeTA: '',
  TAIndex: '',
  AdressIndex: '',
  landmarkIndex: '',
  currentVillage: '',
  homeVillage: '',
  phone: '',
  landmark: '',
  districtID: '' as any,
  homeDistrictStatus: false,
  homeTAID: '' as any,
  homeVillageID: '' as any,
  addLocationID: '' as any,
  currentVillageID: '' as any,
  disableCurrentlyTA: true,
  disableCurrentlyVillage: true,
  disableHomeTA: true,
  disableHomeVillage: true,
  setInput: '' as any,
  districtItems1: [] as any,
  allDistrists: [] as any,
  districtItems2: [] as any,
  districtItems3: [] as any,
  TAItems: [] as any,
  modalData: [] as any,
  AdressItems: [] as any,
  landmarks: [] as any,
  landmarksItems: [] as any,
  busy: false,
  submitted: false,
  usernameValid: false,
  passwordValid: false,
  minUsernameLength: 4,
  minPasswordLength: 4,

  currentHeight: null,
  BarcodeScanner: '',
  estimatedDate: false,
  encounterData: [] as any,
  regexMalawiNationalID: /^(?=[a-zA-Z0-9]*$)(?=\d+[a-zA-Z]|[a-zA-Z]+\d)([a-zA-Z\d]){8}$/,
  regexDate: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
  regexPhone: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
  regexAge: /^[0-9]*$/gm,
  btns: [] as Array<NavBtnInterface>,

  }),
 setup() {
    return {
      search
    };
  },
  mounted(){
    this.btns.push(this.getCancelBtn())
    this.btns.push(this.getClearBtn())
    this.btns.push(this.getSaveBtn())

    const data = this.$route.params;
    if(data.firstname != undefined && data.firstname != "undefined")
      this.firstname = this.capitalizeFirstLetter(data.firstname.toString())
    if(data.surname != undefined && data.surname != "undefined")
      this.lastname = this.capitalizeFirstLetter(data.surname.toString())
    if(data.gender != undefined && data.gender != "undefined")
      this.gender = data.gender;
    
    if(data.birthday != undefined && data.birthday != "undefined")
    {
        this.birthDate = new Date(data.birthday.toString())
        this.birthDate.setDate(this.birthDate.getDate() + 1);
        this.birthDate = new Date(this.birthDate.toString().slice(4, 15)).toISOString().slice(0, 10);
        this.valueDate = this.birthDate
    }
    if(data.malawiNationalID != undefined && data.malawiNationalID != "undefined")
      this.nationalID = data.malawiNationalID

  },
  watch : {

    searchValue:function(val){
      const objList: any = this.modalData;
      for(const x in objList)
      {
        if(!objList[x].value.toLowerCase().includes(this.searchValue.toLowerCase()))
        {
          document.getElementById(objList[x].other.id)?.setAttribute("style","display:none")
        }else
        {
          document.getElementById(objList[x].other.id)?.setAttribute("style","display:block")
        }
      }
    },
    searchDistrictValue:function(val){
      const districtData = [this.districtItems2,this.districtItems1,this.districtItems3];
      for(const districts in districtData)
      {
        const districtList: any = districtData[districts];
        console.log(districtList)
        for(const x in districtList)
        {
          if(!districtList[x].value.toLowerCase().includes(this.searchDistrictValue.toLowerCase()))
          {
            document.getElementById(districtList[x].other.id)?.setAttribute("style","display:none")
          }else
          {
            document.getElementById(districtList[x].other.id)?.setAttribute("style","display:block")
          }
        }
      }
    },
    estimatedAge:function(val)
    {
      const estimatedDate = new Date();
      estimatedDate.setFullYear(estimatedDate.getFullYear()-this.estimatedAge)
      if(this.estimatedAge >= 0 && this.dateLoopBreaker)
      {
        if(this.birthDate == "")
        {
          const currentMonth=('0'+(estimatedDate.getMonth()+1)).slice(-2)
          const currentDay=('0'+(estimatedDate.getDate())).slice(-2)
          this.birthDate = estimatedDate.getFullYear()+"-"+currentMonth+"-"+currentDay;
        }
        else
        {
            const date = this.birthDate.split('-');
            this.birthDate = estimatedDate.getFullYear()+"-"+date[1]+"-"+date[2];
        }
        this.valueDate = this.birthDate
      }
    },
    birthDate:function(val) {
      if(!this.dateLoopBreaker)
      {
        const todayDate = new Date();
        const myDate = new Date(this.birthDate);
        console.log(val)
        const date = this.birthDate.split('-');

        if(
          myDate.getMonth() >= 1 &&
          date[2]&&
          myDate.getFullYear()>= 1800 &&
          myDate <= todayDate
        )
        { 
          const msSince = todayDate.getTime() - myDate.getTime();
          const daysSince = Math.floor(msSince/(1000*60*60*24));
          const YearsSince =Math.floor(daysSince/365);
          if(YearsSince >= 0)
          {
            this.estimatedAge = YearsSince+"";
          }
        }
      }
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
     getSaveBtn(): NavBtnInterface {
      return {
        name: "Save",
        color: "success",
        size: "large",
        slot: "end",
        visible: true,
        onClick: async () => {
          return this.onSave();
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
          return this.clearField();
        }
      }
    },
    modalController(){
      this.isVisible = !this.isVisible;

    },
   async addLocation(locationType: any,locationName: any,parentLocation: any)
    {
     if(this.checkExistanceLocation(locationType,locationName))
      return
     
      const params = {
        'address_type': locationType, 
        'addresses_name': locationName,
        'parent_location': parentLocation
        };
        console.log(params)
        const response = await ApiClient.post("/addresses", params).catch(
          (error) => {
            toastWarning('error while adding data');
            console.warn(error);
          }
        );

        if (response) {
          if (response.status === 200) {
          toastSuccess("Saved Successfuly");
          if(locationType == "TA")
          {
            this.getTraditionalAuthorities()
            .then(()=> this.checkExistanceLocation(locationType,locationName))
            .then(()=> this.addVillage())
          }
          else
          if(locationType == "Village")
          {
            this.getVillages()
            .then(()=> this.checkExistanceLocation(locationType,locationName))
          }
          } else if (response.status === 401) {
            toastWarning("Invalid Name");
          } else {
            toastWarning("An error has occured");
            console.warn(`Response: ${response.status} - ${response.body}`);
          }
        }
    },
    checkExistanceLocation(locationType: any,locationName: any)
    {
      if(locationType == "TA")
      {
        for(let x=0; x < this.TAItems.length; x++)
        {
          this.setCurrentTAValue(this.TAItems[x].value);
          if(this.currentTA.toLowerCase() == locationName.toLowerCase())
            return true
        }
      }
      else
      if(locationType == "Village")
      {
        for(let x=0; x < this.AdressItems.length; x++)
        {
          this.VillageSpriter(this.AdressItems[x].value);
          if(this.currentVillage.toLowerCase() == locationName.toLowerCase())
            return true
        }
      }
    },
  
   capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.toLowerCase().slice(1);
    },
    async onSave() {
     
      if(
         this.validateFirstname() &&
         this.validateLastname() &&
         this.validateGender() &&
         this.validateNationalID() &&
         this.validateBirthDate() &&
         this.validateEstimatedAge()&&
         this.validateCurrentDistrict() &&
         this.validateHomeDistrict() &&
         this.validateCurrentTA() &&
         this.validateHomeTA() &&
         this.validateCurrentVIllage() &&
         this.validateHomeVIllage() &&
         this.validatePhone() &&
         this.validateLandmark()
         ){

        if(!this.nationalID)
          this.nationalID = "unknown"
        if(!this.phone)
          this.phone = "N/A"

        const personPayload: any =  {
          "birthdate":this.birthDate,
          "birthdate_estimated":false,
          "given_name":this.firstname,
          "family_name":this.lastname,
          "gender":this.gender,
          "current_district":this.currentDistrict,
          "current_traditional_authority":this.currentTA,
          "current_village":this.currentVillage,
          "landmark": this.landmark,
          "cell_phone_number": this.phone,
          "relationship":"",
          "home_district":this.homeDistrict,
          "home_traditional_authority":this.homeTA,
          "home_village": this.homeVillage,
          "occupation":"", 
          "facility_name": ""};
        try {
          const person: any = await new PersonService(personPayload).create();
          const parametersPassed: any =  {'person_id': person.person_id, 'program_id': Service.getProgramID(),'malawi_national_ID': this.nationalID};
          if (person.person_id) {
            await new Patientservice(parametersPassed).create()
            .then(() => {
                ProgramService.enrollPatient(person.person_id)
                .then(() => {
                    this.$router.push({
                    name: "Screen Patient", //use name for router push
                    params:  {
                    'patient_id': person.person_id,
                    encounterID: this.encounterData.encounter_id,
                  }
                  });
                })
            });
          }
          toastSuccess('Record has been Created!')
        }catch(e) {
          toastWarning('Unable to create record')
        } 
      }
      else{
        // toastWarning("Complete form to save it");
      }
    },
    clearField()
    {
      this.currentDistrict = "";
      this.currentTA = "";
      this.TAIndex = "";
      this.currentVillage ="";
      this.AdressIndex ="";
      this.landmark = "";
      this.phone = "";
      this.homeDistrict= "";
      this.homeTA = "";
      this.homeVillage ="";
      this.birthDate = "";
      this.estimatedAge = "";     
      
      window.location.href = "/triage_patient/registration/undefined/undefined/undefined/undefined/undefined";
    },
  
    async getDistricts(regionID: number){
      const districts = await LocationService.getDistricts(regionID);
      return districts.map((districtInfo: any) => ({
          label: districtInfo.name,
          value: districtInfo.district_id+'|'+districtInfo.name,
          other: {
              id: districtInfo.district_id
          }
      }))
    },
  
    async getAllDistricts(value: any){
      this.placeholder ="Search District";
      this.addFunction = "";
      this.setPreviousModalValue(value);
      const districtItems1 = await this.getDistricts(1);
      const districtItems2 = await this.getDistricts(2);
      const districtItems3 = await this.getDistricts(3);
      this.modalData = [...districtItems2,...districtItems1,...districtItems3];
      this.modalController();
    },
    setCurrentDistrict(value: any)
    {
      this.setDistrict(value);
      this.disableCurrentlyTA= false;
      this.disableCurrentlyVillage= true;
      this.currentVillage = "";
      this.currentTA = "";
      this.currentDistrict = this.modalValue;
    },
    setHomeDistrict(value: any)
    {
      this.setDistrict(value);
      this.disableHomeTA= false;
      this.disableHomeVillage= true;
      this.homeVillage ="",
      this.homeTA ="";
      this.homeDistrict = this.modalValue;
    }, 
    setDistrict(value: any){
      const data = value.split('|');
      this.AdressIndex = "";
      this.TAIndex = "";
      this.modalValue = data[1];
      this.districtID = data[0];
    },
    setCurrentVillage(event: any)
    {
      console.log(event)
      const data = event.split('|');
      this.homeVillageID = data[1];
      this.currentVillage = data[0];
      this.VillageSpriter(event);
    },
    setHomeVillage(event: any)
    {
      console.log(event)
      const data = event.split('|');
      this.homeVillageID = data[1];
      this.homeVillage = data[0];
      this.VillageSpriter(event);
    },
    async setGender(event: any)
    {
      this.gender = event.detail.value;
    },

    async getClosestLandMark(value: string) {
      this.setPreviousModalValue(value)
      this.addFunction = "addClosestLandMark";
      this.placeholder = "Search Closest Land Mark"
      this.landmarksItems =   [  {
                type: 'radio',
                label:'Catholic Church',
                value:'Catholic Church | 0',
                checked: false,
                 other: {
                 id: 0
          }
                
              },
              {
                type: 'radio',
                label:'CCAP',
                value:'CCAP | 1',
                checked: false,
                 other: {
                 id: 1
          }
              },
              {
                type: 'radio',
                label:'Seventh Day',
                value:'Seventh Day | 2',
                checked: false,
                 other: {
                 id: 2
          }
              },
              {
                type: 'radio',
                label:'Mosque',
                value:'Mosque | 3',
                checked: false,
                 other: {
                 id: 3
          }
              },
              {
                type: 'radio',
                label:'Primary School',
                value:'Primary School | 4',
                checked: false,
                 other: {
                 id: 4
          }
              },
              {
                type: 'radio',
                label:'Borehole',
                value:'Borehole | 5',
                checked: false,
                 other: {
                 id: 5
          }
              },
              {
                type: 'radio',
                label:'Secondary School',
                value:'Secondary School | 6',
                checked: false,
                 other: {
                 id: 6
          }
              },
              {
                type: 'radio',
                label:'College',
                value:'College | 7',
                checked: false,
                 other: {
                 id: 7
          }
              },
              {
                type: 'radio',
                label:'Market',
                value:'Market | 8',
                checked: false,
                 other: {
                 id: 8
          }
              },
              {
                type: 'radio',
                label:'Football Ground',
                value:'Football Ground | 9',
                checked: false,
                 other: {
                 id: 9
          }
              },
              {
                type: 'radio',
                label:'Other',
                value:'Other | 10',
                checked: false,
                 other: {
                 id: 10
          }
              }];
              this.modalData = this.landmarksItems;
           this.modalController();


    },
 
    async addClosestLandMark()
    {
      this.modalController();
      this.alertHeader = 'Add Closest Land Mark or Plot'
      const alert = await alertController
        .create({
          cssClass: 'my-custom-class',
          header: this.alertHeader,
          inputs: [
          {
            type: 'text',
            placeholder: 'Enter Closest Land Mark or Plot .......',
          }
          ],
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary',
              handler: () => {
                console.log('canceled')
              },
            },
         
            {
              text: 'Ok',
             handler: (data) => {
               if(data){
                this.landmark = data[0];
               }
              },
            },
          ],
        });
      return alert.present(); 

    },
    async getDisplayTA(value: string)
    {
      this.addFunction = "addTA";
      this.placeholder ="Search TA"
      this.setPreviousModalValue(value);
      if((!this.disableCurrentlyTA && this.modalType == "currentTA") || (!this.disableHomeTA && this.modalType =="homeTA"))
      {
        await this.getTraditionalAuthorities()
        .then(() => {
              this.modalController();

            })  
      }
        
    },
  
    setModalValue(value: any){
      if(this.modalType == "currentDistrict")
        this.setCurrentDistrict(value);
      else if(this.modalType == "homeDistrict")
        this.setHomeDistrict(value);
      else if(this.modalType == 'currentTA')
        this.setCurrentTAValue(value);
      else if(this.modalType == 'homeTA')
        this.setHomeTAValue(value);  
      else if(this.modalType == 'currentVillage')
        this.setCurrentVillage(value);
      else if(this.modalType == 'homeVillage')
        this.setHomeVillage(value);
      else if(this.modalType == 'closestMark')
        this.setClosestMark(value);
    },
    setPreviousModalValue(value: string){
      this.modalType = value
     if(this.modalType == "currentDistrict")
        this.modalValue = this.currentDistrict;
      else if(this.modalType == "homeDistrict")
        this.modalValue = this.homeDistrict;
      else if(this.modalType == 'currentTA')
        this.modalValue = this.currentTA; 
      else if(this.modalType == 'homeTA')
        this.modalValue = this.homeTA; 
      else if(this.modalType == 'currentVillage')
        this.modalValue = this.currentVillage;
      else if(this.modalType == 'homeVillage')
        this.modalValue = this.homeVillage;
      else if(this.modalType == 'closestMark')
        this.modalValue = this.landmark;
   },
    setClosestMark(value: any){
      const data = value.split('|');
      this.landmark = data[0];
      this.modalValue = data[0];
      this.landmarkIndex= data[1];
    },
    setHomeTAValue(value: any)
    {
      this.setTA(value);
      this.disableHomeVillage= false;
      this.homeVillage ="";
      this.homeVillageID = this.addLocationID;
      this.homeTA = this.modalValue;
    },
    setCurrentTAValue(value: any)
    {
      this.setTA(value);
      this.disableCurrentlyVillage= false;
      this.currentVillage ="";
      this.currentVillageID = this.addLocationID;
      this.currentTA = this.modalValue;
    },
    setTA(value: any){
      const data = value.split('|');
      this.addLocationID = data[0];
      this.modalValue = data[1];
      this.TAIndex =data[2];
      this.AdressIndex ="";
    },
    async getTraditionalAuthorities() {
        const TAs = await LocationService.getTraditionalAuthorities(this.districtID);
        let i = 0;
        this.TAItems = TAs.map((TA: any) => (
        {
            type: 'radio',
            label: TA.name,
            checked: false,
            value: TA.traditional_authority_id+'|'+TA.name+'|'+ i++,
            other: {
                id: TA.traditional_authority_id
            }
        }));
        if(this.TAIndex)
        this.TAItems[this.TAIndex].checked =true

        this.modalData = this.TAItems;
    },
  
     VillageSpriter(value: any)
    {
        const data = value.split('|');
        if(this.modalType == 'currentVillage')
          this.currentVillage =data[0];
        else
        if(this.modalType == 'homeVillage')
          this.homeVillage =data[0];

        this.modalValue = data[0];
        this.AdressIndex =data[2];
    },
    async addTA()
    {
      this.modalController();
      this.alertHeader = 'Add TA'
      const alert = await alertController
        .create({
          cssClass: 'my-custom-class',
          header: this.alertHeader,
          inputs: [
          {
            type: 'text',
            placeholder: 'Enter TA .......',
          }
          ],
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary',
              handler: () => {
                console.log('Confirm Cancel')
              },
            },
         
            {
              text: 'Ok',
             handler: (data) => {
               if(data){
                this.disableCurrentlyVillage= false;
                this.currentTA =data[0]
                this.currentVillage ="";
                this.AdressIndex  ="";
                this.homeVillageID ="";
                this.addLocation("TA",this.currentTA,this.districtID);
                console.log('Confirm Ok')
               }
              },
            },
          ],
        });
      return alert.present();
    },
    
     async getDisplayVillage(value: string)
    {
      this.addFunction = "addVillage";

      this.placeholder ="Search Village"
      this.setPreviousModalValue(value);
      if((!this.disableCurrentlyVillage && this.modalType == "currentVillage") || (!this.disableHomeVillage && this.modalType == "homeVillage"))
      {
        await this.getVillages()
        .then(() => {
          this.modalController();
        })    
      }  
    },
    
    async getVillages() {
      let x = 0;
        let villages;
        if(this.modalType == "homeVillage")
          villages = await LocationService.getVillages(this.homeVillageID)
        else
          villages = await LocationService.getVillages(this.currentVillageID)

      this.AdressItems = villages.map((village: any) => ({
          type: 'radio',
          checked: false,
          label: village.name,
          value: village.name+'|'+village.village_id+'|'+x++,
          other: {
              id: village.village_id
          }
      }));
        if(this.AdressIndex)
      this.AdressItems[this.AdressIndex].checked =true

      this.modalData = this.AdressItems;
    },

    async addVillage()
    {
      console.log(this.currentVillage+"=="+ this.homeVillageID);
      this.alertHeader = 'Add Residential Address'
      const alert = await alertController
        .create({
          cssClass: 'my-custom-class',
          header: this.alertHeader,
          inputs: [
          {
            type: 'text',
            placeholder: 'Residential Address.......',
          }
          ],
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary',
              handler: () => {
                console.log('Confirm Cancel')
              },
            },
         
            {
              text: 'Ok',
             handler: (data) => {
               if(data){
                this.currentVillage =data[0]
                this.addLocation("Village",this.currentVillage,this.addLocationID);
                console.log('Confirm Ok')
               }
              },
            },
          ],
        });
      return alert.present();
    },
    goToNextField() {
     this.$router.push('/screening');
    }
    ,
    async goHome() {
      this.$router.push('/triage');
    }
   ,
   // //////////////////////////// start validate input fields /////////////////////////////////

     validateName()
    {
      this.firstname = this.firstname.replace(/[^A-Za-z]/g,'');
      this.lastname = this.lastname.replace(/[^A-Za-z]/g,'');
    },   
    validateEAge()
    {
      console.log(this.estimatedAge);
      this.estimatedAge = this.estimatedAge.replace(/[^\d]+/g,'');
    },
     validateFirstname() {
      if (!this.firstname) {
        toastWarning('Firstname is empty please fill it')
        return false;
      }
      return true;
    },
    validateLastname() {
      if (!this.lastname) {
        toastWarning('Lastname is empty please fill it')
        return false;
      }
      return true;
    },
    validateGender() {
      if (!this.gender) {
        toastWarning('Gender is empty please fill it')
        return false;
      }
      return true;
    },
 

    validateCurrentDistrict() {
      if (!this.currentDistrict) {
        toastWarning('Current District is empty please fill it')
        return false;
      }
      return true;
    },  
    validateHomeDistrict() {
      if (!this.homeDistrict) {
        toastWarning('Home District is empty please fill it')
        return false;
      }
      return true;
    },
    validateCurrentTA() {
      if (!this.currentTA) {
        toastWarning('Current TA is empty please fill it')
        return false;
      }
      return true;
    },
    validateHomeTA() {
      if (!this.homeTA) {
        toastWarning('Home TA is empty please fill it')
        return false;
      }
      return true;
    },
    validateCurrentVIllage() {
      if (!this.currentVillage) {
        toastWarning('Current village is empty please fill it')
        return false;
      }
      return true;
    },
    validateHomeVIllage() {
      if (!this.homeVillage) {
        toastWarning('Home village is empty please fill it')
        return false;
      }
      return true;
    },  
    validateLandmark() {
      if (!this.landmark) {
        toastWarning('Clossest Landmark is empty please fill it')
        return false;
      }
      return true;
    },

    validatePhone() {
      if (!this.phone) {
        return true;
      }
      else
      if(!this.regexPhone.test(this.phone))
      {
        toastWarning('Not a valid phone number')
        return false;
      }
      return true;
    },
    validateBirthDate() {
      
      if(!this.regexDate.test(this.birthDate))
      {
        toastWarning('Not a valid date of birth')
        return false;
      }
      return true;
    },
     validateEstimatedAge() {
      if(!this.regexAge.test(this.estimatedAge))
      {
        toastWarning('Not a valid estimated age')
        return false;
      }
      return true;
    },
    validateNationalID() {
      if (!this.nationalID) {
        return true;
      }
      else
      if(!this.regexMalawiNationalID.test(this.nationalID))
      {
        toastWarning('Not a valid national ID')
        return false;
      }
      return true;
    },
  // //////////////////////////// end validate input fields /////////////////////////////////

  },
  
});
</script>

<style scoped>
/* .ionic_card {
    text-align: center;
} */

.search_fileds{
height: 48px;
color: #939393;
font-size: 16px;
font-weight: bold;
padding: 10px;
width: 100%; 
border: 1px solid #ccc;
margin: 0px;
margin-top: -8px;
padding-left: 45px;
border-radius: 5px;
margin-bottom: unset !important;
}
.searchIcon {
  position:absolute;
  padding-left: 12px;
padding-top: 8px;
}

.cardfooter{
            width: 100%;
border-top: solid 1px #c2c2c2;
          }
.card-content {
  padding-top: 13px;
padding-bottom: 13px;
flex: 1;
flex: 1;
color: var(--ion-color-step-850, #262626);
font-size: 18px;
text-overflow: ellipsis;
white-space: nowrap;
overflow: hidden;
font-weight: normal;
min-height: 100px;
  height: auto;
overflow:scroll;
max-height: 500px;
}

.radioButton
{
  height: 22px;
color: #939393;
font-size: 15px;
font-weight: bold;
padding: 10px;
width: 40px;
border: 1px solid #bcbcbc;
border-radius: 3px;
margin: 0px;
margin-right: 20px;
margin-bottom: 25px;
}
.get-centered {
  text-align: left;
  padding-bottom: 200px;
}

.list {
  margin-bottom: 0;
}

.input_fileds, input{
  width: calc(100% - 10px);
  font-family: Nimbus Sans L, Arial Narrow, sans-serif;
  font-size: 1.2em;
  padding: 5px;
  margin-bottom: 5px;
  border: 1px solid #909090;
  margin: 5px;
  margin-bottom: 30px;
  height: 50px;
  border-radius: 5px;
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
.header-text {
    font-size: 25px;
    font-weight: bold;
    color: #7d7d7d;
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

.input_fileds:focus, input:focus, .input_fileds.sc-ion-input-md-h.sc-ion-input-md-s.md.hydrated:focus-within {
    outline: none !important;
    border: solid 2px #719ECE;
    box-shadow: 0 0 2px #202020;
    height: 50px;
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
.alert-button-group.sc-ion-alert-md {
    background: green;
}
input:focus-visible {
  outline: none;
    border-radius: unset;
    border: solid 2px #719ECE;
}

.birthday-picker.input_fileds {
  margin: 0px;
  margin-top:5px;
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
  width: 25px;
  height: 25px;
  padding: 3px;
  margin-right: 3px;
  /* background-color only for content */
  background-clip: content-box;
  border: 2px solid #bbbbbb;
  background-color: #e7e6e7;
  border-radius: 50%;
  margin-bottom: -6px;
margin-top: 25px;
margin-right: 25px;
margin-left: 10px;
}

/* appearance for checked radiobutton */
input[type="radio"]:checked + label:before {
    background-color: var(--ion-color-primary, #3880ff);
  border: 2px solid var(--ion-color-primary, #3880ff);
}

/* optional styles, I'm using this for centering radiobuttons */
label {
  /* display: flex; */
  /* align-items: center; */
  width:40px;
}
.popover-content.sc-ion-popover-md {
    top: 224px !important;
    width: 160px;
    overflow: unset;
    left: 26px !important;
}
.gender{
  background-color: #fff;
  padding-left: 5px;
  border: 1px #909090 solid;
  margin: unset;
  margin-top: 5px;
}
select:invalid { color: gray; }
option {
    height: 50px;
}
label{
  margin-left: 6px;
  font-size: 20px;
font-weight: 500;
color: #666;
}
.input-lable{
  width: 50%;
}
</style>



<style >
input {
  background-color: #fff;
}
input:focus{
    outline: none !important;
    border: solid 2px #719ECE;
    box-shadow: 0 0 2px #202020;
}
.search_fileds > .native-input.sc-ion-input-md {
    padding-left: 42px;
}
#cover-page
{
 background-color: #202020;
z-index: 100;
height: 100%;
width: 100%;
position: absolute;
opacity: 0.5;
}

.ionic_card{
  width: 350px;  position: absolute;
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

.birthday-picker td a {
    padding: 1vw;
    border-radius: 3vw;
}
.birthday-picker_dropdown {
    font-size: 2.16vw;
}
.dropdown {
    position: relative;
    display: inline-block;
}
.dropdown::before {
  position: absolute;
  content: "\25BC";
  top: 15px;
  right: 0px;
  height: 20px;
  width: 20px;
  font-size: 8px;
}


</style>

