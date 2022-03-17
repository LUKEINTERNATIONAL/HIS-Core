<template>

     <!-- Start the pop up -->
      <ion-card class="ionic_card_red" id="generalModal" >
        <ion-card-header style="border-bottom: 1px solid rgb(110, 57, 57);">
          <div class="alert-header">
            <img src="assets/images/warning.png"  alt="" style="width: 40px;">
            <span style="padding-top: 9px;">Triage Alert</span>
           
          </div>
        </ion-card-header>
        <ion-card-content class="card-content" style="float: left; padding: 10px; width:100%">
          <ion-row  >
            <div style="padding:15px; width:100%">
              <ol>
                <li v-if="covidTestAlert != 'null'">{{covidTestAlert}}</li>
                <li v-if="emergenceAlert">{{emergenceAlert}}</li>
              </ol>
            </div>
          </ion-row>
        </ion-card-content> 
        <ion-row class="cardfooter">
          <ion-col class="ionic_card_col">
              <div  @click="closeModal" class="btnCancel" >Cancel</div>
          </ion-col>
        </ion-row>
      </ion-card> 
    <!-- End the pop up -->
  <div id="cover-page" @click="closeModal" ></div>
</template>

<script>
import { search } from "ionicons/icons";
export default {
   
        
      props:{
        emergenceAlert: String,
        modalData: Array,
        propModalValue: String,
        covidTestAlert: String,
        
    },
     data() {
         return {
            modalValue: this.propModalValue
         }
      },
        
    setup() {
       
    return {
      search
    };

  },

methods:{
    closeModal(){
        this.$emit('toggle-modal');
    },
    setModalValue(value){
       
        this.$emit('setModalValue',value);
    }
}
}
</script>


<style scoped>
/* .ionic_card_red {
    text-align: center;
} */


.cardfooter{
            width: 100%;
border-top: solid 1px rgb(110, 57, 57);
          }
.card-content {

color: #cbc6c6;
font-size: 20px;
text-overflow: ellipsis;
white-space: nowrap;
overflow: hidden;
min-height: 100px;
height: auto;
max-height: 500px;
}


.get-centered {
  text-align: left;
}

.list {
  margin-bottom: 0;
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
  height: 7vh;
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
.birthday-picker {
    
    border-radius: 0px;
}
.birthday-picker.input_fileds {
  margin: 0px;
  width: 100%;
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
.alert-header{
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  color: rgb(209, 139, 8);
  display: flex;
  justify-content: center;
}
.btnCancel{
background-color: #5c0404;
color: #a3a0a0;
padding: 10px;
border: solid 1px gray;
border-radius: 5px;
}
li{
  padding: 20px;
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

.ionic_card_red{
  width: 700px;  position: absolute;
z-index: 1100;
margin-left: auto;
margin-right: auto;
left: 0;
right: 0;
max-height: 95%;
margin-top: 150px;
background-color: #491818;
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
