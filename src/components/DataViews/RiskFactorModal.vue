<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Lab orders</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content :style="{ overflowY: 'hidden', background: 'grey' }" >
  <ion-grid>
  <ion-row>
  <ion-col size="4">
  <ion-list :style="{overflowY: 'auto', height:'78vh'}"> 
      <ion-item
        v-for="(data, index) in testTypes" :key="data"
        @click="getSpecimens(data.name, index)"
        :detail="true"
      > 
        <ion-label> {{ data.name }} </ion-label>
        <ion-checkbox v-model="data.isChecked" slot="start"/>
      </ion-item>
    </ion-list>
    </ion-col>
    <ion-col 
      :style="{overflowY: 'auto', height:'78vh'}"
      v-if="activeIndex != null && selectedOrders.length > 0">
    <div style="">
      <ion-list> 
      
    <ion-radio-group v-model="testTypes[activeIndex]['specimen']">
      <div class="side-title">
        Select specimen
      </div>
        <!-- :color="isActive(item) ? 'primary' : ''" -->
        <ion-item v-for="data in specimens" :key="data" > 
      <ion-label>{{data.name}}</ion-label>
        <ion-radio slot="start" :value="data.name" @click="addSpecimen(data)"></ion-radio>
      </ion-item>
    </ion-radio-group>
    </ion-list>
    <ion-radio-group v-model="testTypes[activeIndex]['reason']">
      <div class="side-title">
        Main test(s) reason
      </div>
        <!-- :color="isActive(item) ? 'primary' : ''" -->
        <ion-item v-for="data in reasons" :key="data"> 
      <ion-label>{{data}}</ion-label>
        <ion-radio slot="start" :value="data" ></ion-radio>
      </ion-item>
    </ion-radio-group>
      </div>
      <p/>
       <div :style="{background: 'lightyellow', height: '200px'}">
         <table>
           <thead>
             <tr>
               <td>Test</td>
               <td>Specimen</td>
               <td>Reason</td>
               <td>Action</td>
             </tr>
           </thead>
           <tbody>
             <tr v-for="(data, index) in finalOrders" :key="index">
               <td>{{data.name}}</td>
               <td>{{data.specimen}}</td>
               <td>{{data.reason}}</td>
               <td><ion-button @click="removeOrder(data.currentIndex)" slot="end" color="danger">X</ion-button></td>
             </tr>
           </tbody>
         </table>
      </div>
    </ion-col>
  </ion-row>
</ion-grid> 
  </ion-content>
  <ion-footer>
    <ion-toolbar> 
      <ion-button @click="postActivities" slot="end" :disabled="finalOrders.length === 0"> Place orders </ion-button>
      <ion-button @click="closeModal([])" slot="start" color="danger"> Close </ion-button>
    </ion-toolbar>
  </ion-footer>
</template>
<script lang="ts">
import {
  IonContent,
  IonButton,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonLabel,
  modalController,
  IonList,
  IonItem,
  IonCheckbox,
  IonRadioGroup,
  IonRow,
} from "@ionic/vue";
import { defineComponent, PropType } from "vue";
import { ActivityInterface } from "@/apps/interfaces/AppInterface"
import HisMultipleSelect from "../FormElements/HisMultipleSelect.vue";
export default defineComponent({
  name: "Modal",
  props: {
    activities: {
      type: Object as PropType<ActivityInterface[]>,
      required: true
    },
    title: {
      type: String, 
      default: ""
    },
  },
  methods: {
   // 
  },
  computed: {
   // 
  },
  mounted() {
    // this.getActivities();
  },
  data() {
    return {
      content: "Content",
      activeIndex: null as any
    };
  },
  components: {
    HisMultipleSelect
    
    //
  },
});
</script>
