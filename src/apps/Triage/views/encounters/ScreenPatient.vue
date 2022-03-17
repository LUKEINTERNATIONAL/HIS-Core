<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-row>
          <ion-col>
            <ion-text>
              <span class="header-text ">
                Client Screening
              </span>
            </ion-text>
          </ion-col>
        </ion-row>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" :fullscreen="true" >
      <ion-row>
        <form novalidate>
          <ion-row>
            <table>
              <tr>
                <td>Has the client been reffered</td>
                <td> 
                  <label>
                    <input v-model="typeVist" :value="'Yes'" type="radio" name="radio1" id="radio1" />
                    <label for="radio1">Yes</label>
                    <input v-model="typeVist" :value="'No'" type="radio" name="radio1" id="radio2" />
                    <label for="radio2">No</label>
                  </label>
                </td>
              </tr>
              <tr>
                <td>Health faclity/MOH staff</td>
                <td> 
                    <label>
                      <input v-model="typePatient" :value="'Yes'" type="radio" name="radio2" id="radio3" />
                      <label for="radio3">Yes</label>
                      <input v-model="typePatient" :value="'No'" type="radio" name="radio2" id="radio4" />
                      <label for="radio4">No</label>
                  </label>
                </td>
              </tr>
              <tr>
                <td>Fever or Chills
                </td>
                <td>  
                  <label>
                    <input v-model="noOtherSymptom" :value="'No other symptom'" type="radio" name="radio3" id="radio5" />
                    <label for="radio5">Yes</label>
                    <input v-model="noOtherSymptom" :value="'No'" type="radio" name="radio3" id="radio6" />
                    <label for="radio6">No</label>
                  </label>
                </td>
              </tr>
              <tr>
                <td>Cough for any duration?</td>
                <td>  
                    <label>
                    <input v-model="coughDuration" :value="'Cough'" type="radio" name="radio4" id="radio7" />
                    <label for="radio7">Yes</label>
                    <input v-model="coughDuration" :value="'No'" type="radio" name="radio4" id="radio8" />
                    <label for="radio8">No</label>
                  </label>
                </td>
              </tr>
              <tr>
                <td>Difficulty Breathing?</td>
                <td> 
                    <label>
                    <input v-model="difficultyBreathing" :value="'Difficulty breathing'" type="radio" name="radio5" id="radio9" />
                    <label for="radio9">Yes</label>
                    <input v-model="difficultyBreathing" :value="'No'" type="radio" name="radio5" id="radio10" />
                    <label for="radio10">No</label>
                  </label>
                </td>
              </tr>
              <tr>
                <td> Loss of taste and/or smell
                </td>
                <td> 
                    <label>
                    <input v-model="lossTaste" :value="'Loss of taste or smell'" type="radio" name="radio6" id="radio11" />
                    <label for="radio11">Yes</label>
                    <input v-model="lossTaste" :value="'No'" type="radio" name="radio6" id="radio12" />
                    <label for="radio12">No</label>
                  </label>
                </td>
              </tr>
              <tr>
                <td>History of COVID-19 contact?</td>
                <td>  
                  <label>
                    <input v-model="historyCovidContact" :value="'Yes'" type="radio" name="radio7" id="radio13" />
                    <label for="radio13">Yes</label>
                    <input v-model="historyCovidContact" :value="'No'" type="radio" name="radio7" id="radio14" />
                    <label for="radio14">No</label>
                  </label><br/>
                  <input v-model="historyCovidContact" :value="'Unknown'" type="radio" name="radio7" id="unradio14" />
                    <label for="unradio14">Unknown</label>
                </td>
              </tr>
               <tr>
                <td>Fatigue</td>
                <td>  
                  <label>
                    <input v-model="fatigue" :value="'Fatigue'" type="radio" name="radio8" id="radio15" />
                    <label for="radio15">Yes</label>
                    <input v-model="fatigue" :value="'No'" type="radio" name="radio8" id="radio16" />
                    <label for="radio16">No</label>
                  </label>
                </td>
              </tr>
                <tr>
                <td>Shortness of breath</td>
                <td>  
                  <label>
                    <input v-model="shortnessBreath" :value="'Shortness of breath'" type="radio" name="radio9" id="radio17" />
                    <label for="radio17">Yes</label>
                    <input v-model="shortnessBreath" :value="'No'" type="radio" name="radio9" id="radio18" />
                    <label for="radio18">No</label>
                  </label>
                </td>
              </tr>
                <tr>
                <td>Diarrhea</td>
                <td>  
                  <label>
                    <input v-model="diarrhea" :value="'Diarrhea'" type="radio" name="radio10" id="radio19" />
                    <label for="radio19">Yes</label>
                    <input v-model="diarrhea" :value="'No'" type="radio" name="radio10" id="radio20" />
                    <label for="radio20">No</label>
                  </label>
                </td>
              </tr>
                <tr>
                <td>Nausea or vomiting</td>
                <td>  
                  <label>
                    <input v-model="vomiting" :value="'Vomiting'" type="radio" name="radio11" id="radio21" />
                    <label for="radio21">Yes</label>
                    <input v-model="vomiting" :value="'No'" type="radio" name="radio11" id="radio22" />
                    <label for="radio22">No</label>
                  </label>
                </td>
              </tr>
               <tr>
                <td>Muscle or body pains aches</td>
                <td>  
                  <label>
                    <input v-model="generalisedBodyPains" :value="'Generalised body Pains'" type="radio" name="radio13" id="radio25" />
                    <label for="radio25">Yes</label>
                    <input v-model="generalisedBodyPains" :value="'No'" type="radio" name="radio13" id="radio26" />
                    <label for="radio26">No</label>
                  </label>
                </td>
              </tr>
             
               <tr>
                <td>Sore throat</td>
                <td>  
                  <label>
                    <input v-model="soreThroat" :value="'Sore throat'" type="radio" name="radio14" id="radio27" />
                    <label for="radio27">Yes</label>
                    <input v-model="soreThroat" :value="'No'" type="radio" name="radio14" id="radio28" />
                    <label for="radio28">No</label>
                  </label>
                </td>
              </tr>
              <tr>
                <td>Client primary entry point</td>
                <td > 
                  <label>
                    <select v-model="entryPoint" class="entry-options">
                      <option value="ANC">ANC</option>
                      <option value="MNCH">MNCH</option>
                      <option value="ART">ART</option>
                      <option value="OPD">OPD</option>
                      <option value="STI">STI</option>
                      <option value="TB">TB</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                </td>
              </tr>
            </table>
          </ion-row>
        </form>
      </ion-row>
    </ion-content>
    <his-footer :btns="btns" />
  </ion-page>
</template>

<script lang="ts">
import {
  IonContent,
  IonRow,
  IonCol,
  IonText,
  IonToolbar,
  IonHeader,
  IonPage,
  IonButton,
} from "@ionic/vue";
import { defineComponent } from "vue";
import { toastWarning, toastSuccess } from "@/utils/Alerts"
import { EncounterService } from "@/services/encounter_service";
import { Encounter } from "@/interfaces/encounter";
import HisDate from "@/utils/Date"
import { ObservationService } from "@/services/observation_service";

import HisFooter from "@/components/HisDynamicNavFooter.vue";
import { alertConfirmation } from "@/utils/Alerts";
import { NavBtnInterface } from "@/components/HisDynamicNavFooterInterface";

export default defineComponent({
  name: "Home",
  components: {
    IonRow,
    IonCol,
    IonContent,
    IonPage,
    IonText,
    IonToolbar,
    IonHeader,
    HisFooter
  },

 data() {
    return {
      typeVist: '' as any,
      typePatient: '' as any,
      chronicCondition: '' as any,
      coughDuration: '' as any,
      difficultyBreathing: '' as any,
      historyCovidContact: '' as any,
      entryPoint: '' as any,
      currentDate: '' as any,
      encounters: [] as Array<Encounter>,
      triageAlertsList: [] as any,
      encountersCardItems: [] as any,
      registrationEncounterID: '' as any,
      presentingComplantEncounterID: '' as any,

      observations: [] as any,

      noOtherSymptom: '' as any,
      lossTaste: '' as any,
      fatigue: '' as any,
      shortnessBreath: '' as any,
      diarrhea: '' as any,
      vomiting: '' as any,
      generalisedBodyPains: '' as any,
      soreThroat: '' as any,
      presentingComplainsStatus: false,
      btns: [] as Array<NavBtnInterface>,

    };
  },
 async mounted(){
  this.btns.push(this.getCancelBtn())
  this.btns.push(this.getClearBtn())
  this.btns.push(this.getNextBtn())

  this.currentDate = HisDate.currentDisplayDate();
  const currentDate = new Date(this.currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
  const date = new Date(currentDate).toISOString().slice(0, 10);
  const patientID: any = this.$route.params.patient_id;
  // const patientID: any = 234162;
  this.encounters = await EncounterService.getEncounters(patientID, {date})
  
  for(const totalEncounters in this.encounters)
  {
  if(this.encounters[totalEncounters].observations.length > 0 && ( this.encounters[totalEncounters].encounter_type ==194 || this.encounters[totalEncounters].encounter_type ==104))
  {
    if(this.encounters[totalEncounters].encounter_type ==194 ){
      this.noOtherSymptom = "No"
      this.coughDuration = "No";
      this.difficultyBreathing = "No";
      this.lossTaste = "No"
      this.fatigue = "No";
      this.shortnessBreath = "No";
      this.diarrhea = "No";
      this.vomiting = "No"
      this.generalisedBodyPains = "No";
      this.soreThroat = "No"
    }

    if(this.encounters[totalEncounters].encounter_type ==194)
      this.registrationEncounterID = this.encounters[totalEncounters].encounter_id;
    if(this.encounters[totalEncounters].encounter_type ==104)
      this.presentingComplantEncounterID = this.encounters[totalEncounters].encounter_id;

    for(const x in this.encounters[totalEncounters].observations)
    {
      const conceptID = this.encounters[totalEncounters].observations[x].concept_id;
      const valueText = this.encounters[totalEncounters].observations[x].value_text;
      if(conceptID == 6189)
      {
        const valueCoded = this.encounters[totalEncounters].observations[x].value_coded;
        if(valueCoded == 9675)
          this.typeVist = "Yes";
        if(valueCoded == 7572)
          this.typeVist = "No";
      }
      if(conceptID == 10534)
      {
        this.typePatient = valueText;
      }
     
 
      if(conceptID == 10537)
      {
        this.difficultyBreathing = valueText;
      }
    
      if(conceptID == 10539)
      {
        this.historyCovidContact = valueText;
      }
      if(conceptID == 10540)
      {
        this.entryPoint = valueText;
      }
      if(valueText =='No other symptom')
        this.noOtherSymptom = valueText;
      if(valueText =='Cough')
        this.coughDuration = valueText;
      if(valueText =='Difficulty breathing')
        this.difficultyBreathing = valueText;
      if(valueText =='Loss of taste or smell')
        this.lossTaste = valueText;
      if(valueText =='Fatigue')
        this.fatigue = valueText;
      if(valueText =='Shortness of breath')
        this.shortnessBreath = valueText;
      if(valueText =='Diarrhea')
        this.diarrhea = valueText;
      if(valueText =='Vomiting')
        this.vomiting = valueText;
      if(valueText =='Generalised body Pains')
        this.generalisedBodyPains = valueText; 
      if(valueText =='Sore throat')
        this.soreThroat = valueText;

        console.log(valueText)
    }
  }
  }
// alert(JSON.stringify(this.encountersCardItems));
 },
  computed: {
    validateTypeVist() {
      if (!this.typeVist) {
       toastWarning('Client reffered is empty please fill it')
       return false;
      }
      return true;
    },
    validateTypePatient() {
      if (!this.typePatient) {
       toastWarning('Health faclity/MOH staff is empty please fill it')
       return false;
      }
      return true;
    },
    validateNoOtherSymptom() {
      if (!this.noOtherSymptom) {
       toastWarning('Fever or Chills is empty please fill it')
       return false;
      }
      return true;
    },
    validateCoughDuration() {
      if (!this.coughDuration) {
       toastWarning('Cough for any duration is empty please fill it')
       return false;
      }
      return true;
    },
    validateDifficultyBreathing() {
      if (!this.difficultyBreathing) {
       toastWarning('Difficulty Breathing is empty please fill it')
       return false;
      }
      return true;
    },
    validatelossTaste() {
      if (!this.lossTaste) {
       toastWarning('Loss of taste or smell is empty please fill it')
       return false;
      }
      return true;
    },
    validateHistoryCovidContact() {
      if (!this.historyCovidContact) {
       toastWarning('History of COVID-19 contact is empty please fill it')
       return false;
      }
      return true;
    },
    validateEntryPoint() {
      if (!this.entryPoint) {
       toastWarning('Client entry point is empty please fill it')
       return false;
      }
      return true;
    },
    validateFatigue() {
      if (!this.fatigue) {
       toastWarning('Fatigue is empty please fill it')
       return false;
      }
      return true;
    },
    validateShortnessBreath() {
      if (!this.shortnessBreath) {
       toastWarning('Shortness of breath is empty please fill it')
       return false;
      }
      return true;
    },
    validateDiarrhea() {
      if (!this.diarrhea) {
       toastWarning('Diarrhea is empty please fill it')
       return false;
      }
      return true;
    },
    validateVomiting() {
      if (!this.vomiting) {
       toastWarning('Nausea or vomiting is empty please fill it')
       return false;
      }
      return true;
    },
    validateGeneralisedBodyPains() {
      if (!this.generalisedBodyPains) {
       toastWarning('Generalised body Pains is empty please fill it')
       return false;
      }
      return true;
    },
    validateSoreThroat() {
      if (!this.soreThroat) {
       toastWarning('Sore throat is empty please fill it')
       return false;
      }
      return true;
    },
 
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
     getNextBtn(): NavBtnInterface {
      return {
        name: "Next",
        color: "success",
        size: "large",
        slot: "end",
        visible: true,
        onClick: async () => {
          return this.saveTriageData();
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
      getActivitiesCardInfo(encounters: Array<Encounter>) {
        return encounters.map((encounter: Encounter) => ({
            label: encounter.type.name,
            value: HisDate.toStandardHisTimeFormat(encounter.encounter_datetime),
            other: {
                id: encounter.encounter_id,
                columns: ['Observation', 'Value', 'Time'],
            
                getRows: async () => {
                    const data = []
                    const { observations } = encounter
                    for(const index in observations) {
                        const obs =  observations[index]
                        const concept = obs.concept.concept_names[0].name
                        const value = await ObservationService.resolvePrimaryValue(obs)
                        const time = HisDate.toStandardHisTimeFormat(obs.obs_datetime)
                        data.push([concept, value, time])
                    }
                    return data
                }
            }
        }))
    },
    clearInputField(){
        this.typeVist ="";
        this.typePatient ="";
        this.coughDuration ="";
        this.difficultyBreathing ="";
        this.historyCovidContact ="";
        this.entryPoint ="";
        this.noOtherSymptom ="";
        this.lossTaste = "";
        this.fatigue = "";
        this.shortnessBreath= "";
        this.diarrhea ="";
        this.vomiting ="";
        this.generalisedBodyPains ="";
        this.soreThroat = "";
    },
 
    goHome(){
      this.$router.push('/triage');
    },
    async voidEncounter()
    {
      if(this.registrationEncounterID)
        await EncounterService.voidEncounter(this.registrationEncounterID, 'Duplicate')
      if(this.presentingComplantEncounterID)
        await EncounterService.voidEncounter(this.presentingComplantEncounterID, 'Duplicate')
    },
   async saveTriageData(){
     this.triageAlerts();
     this.voidEncounter().then(()=>{
        if(this.validateTypeVist && this.validateTypePatient &&
        this.validateNoOtherSymptom && this.validatelossTaste && 
        this.validateCoughDuration && this.validateDifficultyBreathing && 
        this.validateHistoryCovidContact && this.validateEntryPoint &&
        this.validateFatigue && this.validateShortnessBreath &&
        this.validateDiarrhea && this.validateSoreThroat &&
        this.validateGeneralisedBodyPains && this.validateShortnessBreath 
      
        )
        {

          try {
            const patientID = this.$route.params.patient_id;
            this.createEncounter(patientID) 
            .then((data: Encounter) => {
              this.createTriageObs(data.encounter_id)
              .then(() => {
                this.createPresentingComplainHash();
                if(this.presentingComplainsStatus == false)
                  this.redirectToVitalsPages()
                  else
                  this.createPresentingComplantsEncounter(patientID)
                .then((data: Encounter) => {
                  if(this.presentingComplainsStatus == true)
                    this.createPresentingComplainsObs(data.encounter_id) 
                  .then(()=> {
                    this.redirectToVitalsPages();
                  })
                });
              });
            });

          toastSuccess('Record has been Created!')
          }catch(e) {
            toastWarning('Unable to create record')
          } 
      }
      else {
        // toastWarning("Complete form to save it");
      }

     })
  
    
    },
    triageAlerts(){
      if(
        (this.shortnessBreath != "No" && this.historyCovidContact != "No" && this.historyCovidContact != "Unknown") || 
        (this.coughDuration != "No" && this.difficultyBreathing!= "No" && this.lossTaste != "No")|| 
        (this.coughDuration != "No" && this.difficultyBreathing != "No" && this.soreThroat != "No")
        ){
         this.triageAlertsList = "The patient should go for COVID-19 test";
      }else{
        this.triageAlertsList = "null";
      }
    },
    redirectToVitalsPages(){
      const patientID = this.$route.params.patient_id;
      const params ={ name: "triage_vitals", 
            params: { 'patient_id': patientID,
                      'triageAlerts':this.triageAlertsList,
                      }};
            this.$router.push(params)
    },
    createEncounter(patientID: any) {
    
    return EncounterService.create({
        'encounter_type_id': 104, //TODO: get key from api or reference dictionary using name
        'patient_id': patientID
    })
    },
     createPresentingComplantsEncounter(patientID: any) {
    
    return EncounterService.create({
        'encounter_type_id': 194, //TODO: get key from api or reference dictionary using name
        'patient_id': patientID
    })
    },
    createPresentingComplainHash(){
     
         const presentingComplaintsNameHash =[ 
          "5945;"+this.noOtherSymptom+";Fever",
          "7644;"+this.coughDuration+";Respiratory",
          "7411;"+this.difficultyBreathing+";ILI",
          "7411;"+this.lossTaste+";ILI",
          "7027;"+this.fatigue+";General",
          "9560;"+this.shortnessBreath+";Cardiovascular",
          "7661;"+this.diarrhea+";Gastrointestinal",
          "7661;"+this.vomiting+";Gastrointestinal",
          "7027;"+this.generalisedBodyPains+";General",
          "7411;"+this.soreThroat+";ILI" 
       ]

    const conceptID =  8578;
    for(let i = 0 ; i < presentingComplaintsNameHash.length ; i++)
    {
      const data = presentingComplaintsNameHash[i].split(";");
      if(data[1] != "No")
      {
        this.observations.push({
          'concept_id': conceptID, 
          'value_text':data[2],
          child: {
            'concept_id': data[0],
            'value_text': data[1]
        }
        })
        this.presentingComplainsStatus = true;
      }
    }
    },
    createPresentingComplainsObs(encounterID: any) {
     
 
     const obs = {"encounter_id": encounterID,
    "observations":this.observations }
    return ObservationService.create(obs);

    
    },
    createTriageObs(encounterID: any) {
      let ans;
      if(this.typeVist == "Yes")
        ans = 9675;
      else
       ans  = 7572;

      const observations = [
        {
          'concept_id': 6189, 
          'value_coded': ans
        },
      
        {
          'concept_id': 10534, 
          'value_text': this.typePatient,
        },
     
        {
          'concept_id': 10539, 
          'value_text': this.historyCovidContact,
        },
        {
          'concept_id': 10540, 
          'value_text': this.entryPoint,
        }
      ];

      const obs = {"encounter_id": encounterID,
      "observations":observations }
      return ObservationService.create(obs);
    },

  },
});
</script>

<style scoped>

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
  font-size: 20px;
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
input[type=checkbox]  {
    border: 0px;
    width: 100%;
    height: 2.2em;
}
input[type=radio]  {
    border: 0px;
    width: 100%;
    height: 2em;
}
form
{
  width: 100%;
}
label
{
  display: flex;
  width: 200px;
  text-align: center;
}
.entry-options
{
  padding: 8px;
width: 280px;
border: 1px solid #dfdfdf;
border-radius: 4px;
margin-right: 50px;
background: #fff;
}
span
{
  margin: 0px;
  margin-top: 9px;
  margin-right: 25px;

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
  width:400px;
}
</style>
