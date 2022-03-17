<template>

     <!-- Start the pop up -->
      <ion-card class="ionic_card" id="generalModal" >
        <ion-card-header style="border-bottom: 1px solid #c2c2c2;">
          <div >
            <ion-icon
            class="searchIcon"
              :icon="search"
              size="large"
            ></ion-icon>
          <ion-input
            v-model="searchValue"
            name="dataSearch"
            id="dataSearch"
            autofocus="true"
            ref="email"
            type="text"
            spellcheck="false"
            autocapitalize="off"
            required
            class="input_fileds search_fileds"
            :placeholder="placeholder"
            @input="searchData($event.target.value)"
          >
          </ion-input>
          </div>
        </ion-card-header>
        <ion-card-content class="card-content" style="float: left; padding: 10px; width:100%">
          <ion-row v-for="item in modalData" v-bind:key="item"  >
            <input
              class="radioButton" 
              type="radio"
              :id="item.label" 
              :value="item.label" 
              @click="setModalValue(item.value),closeModal()" 
               v-model="modalValue" 
              >
              <label label :id="item.other.id" :for="item.label">{{item.label}}</label>
          </ion-row>
        </ion-card-content> 
        <ion-row class="cardfooter">
          <ion-col class="ionic_card_col">
              <div  @click="closeModal" style="color:red" >Cancel</div>
              <div v-if="additionalFunction !='' " @click="addBtn(additionalFunction)" >Add</div>
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
        placeholder: String,
        modalData: Array,
        propModalValue: String,
        additionalFunction: String,
        
    },
     data() {
         return {
            modalValue: this.propModalValue
         }
      },
           created() {
    
    setTimeout(function() { 
       
        document.getElementById("dataSearch").lastElementChild.focus();
       
     }, 500);
  },
    setup() {
       
    return {
      search
    };

  },

methods:{
    searchData(searchValue){
             const objList = this.modalData;
      for(const x in objList)
      {
        if(!objList[x].value.toLowerCase().includes(searchValue.toLowerCase()))
        {
          document.getElementById(objList[x].other.id)?.setAttribute("style","display:none")
        }else
        {
          document.getElementById(objList[x].other.id)?.setAttribute("style","display:block")
        }
      }
    },
    closeModal(){
        this.$emit('toggle-modal');
    },
    setModalValue(value){
       
        this.$emit('setModalValue',value);
    },
    addBtn(value){
      console.log(value);
      if(value == "addTA")
        this.$emit('addTA');
      else if(value == "addVillage")
        this.$emit('addVillage');
      else if(value == "addClosestLandMark")
        this.$emit('addClosestLandMark');
    }
}
}
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
}

.list {
  margin-bottom: 0;
}

.input_fileds, input{
  width: calc(100% - 10px);
  font-family: Nimbus Sans L, Arial Narrow, sans-serif;
  font-size: 1.2em;
  color: #525252;
  padding: 5px;
  margin-bottom: 5px;
  border: 1px solid #909090;
  margin: 5px;
  margin-bottom: 30px;
  height: 50px;
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
</style>



<style >
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


</style>
