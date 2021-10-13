<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Lab orders</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding" >
  <ion-grid>
  <ion-row>
    <ion-col  size="6" style="height: 90%; ">
  <ion-list> 
      <ion-item
         v-for="(data, index) in testTypes" :key="data"
         @click="getSpecimens(data.name, index)"
      > 
        <ion-label> {{ data.name }} </ion-label>
        <ion-checkbox v-model="data.isChecked" slot="start"/>
      </ion-item>
    </ion-list>
    </ion-col>
    <ion-col v-if="activeIndex != null && selectedOrders.length > 0">
      <div style="">
      <ion-list> 
      
    <ion-radio-group v-model="testTypes[activeIndex]['specimen']">
      <ion-list-header>
        <ion-label>Select specimen</ion-label>
      </ion-list-header>
        <!-- :color="isActive(item) ? 'primary' : ''" -->
        <ion-item
         v-for="data in specimens" :key="data" 
        :detail="true"
      > 
      <ion-label>{{data.name}}</ion-label>
        <ion-radio slot="start" :value="data.name" @click="addSpecimen(data)"></ion-radio>
      </ion-item>
    </ion-radio-group>
    </ion-list>
    <ion-radio-group v-model="testTypes[activeIndex]['reason']">
      <ion-list-header>
        <ion-label>Select Reason</ion-label>
      </ion-list-header>
        <!-- :color="isActive(item) ? 'primary' : ''" -->
        <ion-item
          v-for="data in reasons" :key="data"
        :detail="true"
      > 
      <ion-label>{{data}}</ion-label>
        <ion-radio slot="start" :value="data" ></ion-radio>
      </ion-item>
    </ion-radio-group>
      </div>
       <div>
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
      <ion-button @click="closeModal" slot="start" color="danger"> Close </ion-button>
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
import { toastSuccess, toastWarning } from "@/utils/Alerts"
import { OrderService } from "@/services/order_service";
import { LabOrderService } from "@/apps/ART/services/lab_order_service";
import { alertAction } from "@/utils/Alerts"
import { PrintoutService } from "@/services/printout_service";
interface ActivityInterface {
  value: string;
  selected: boolean;
}
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
  watch: {
    activities: {
      handler(activities: Array<ActivityInterface>){
        if (activities) {
          this.appActivities = [...activities]
          this.getActivities();
        }
      },
      immediate: true
    }
  },
  methods: {
    async getActivities() {
     this.testTypes = await OrderService.getTestTypes();
    },
    async getSpecimens(testName: string, index: number) {
     this.specimens = await OrderService.getSpecimens(testName);
     this.testTypes[index]['currentIndex'] = index;
     this.activeIndex = index;
    },
    removeOrder(index: number) {
      this.testTypes[index]['isChecked'] = false;
    },
    addSpecimen(data: any) {
      this.testTypes[this.activeIndex]['specimenConcept'] = data.concept_id;
    },
    async postActivities() {
      const patientID= `${this.$route.params.patient_id}`;
      const orders = new LabOrderService(parseInt(patientID), -1); //TODO: get selected provider for this encounter
      const encounter = await orders.createEncounter();
      if(encounter) {
        const formattedOrders = await OrderService.buildLabOrders(encounter, this.finalOrders);
        const d =await  OrderService.saveOrdersArray(encounter.encounter_id, formattedOrders);
        if(!d) 
          return toastWarning('Unable to save lab orders')
        alertAction('Lab orders and encounter created!, print out your last orders?', [
        {
          text: 'Yes',
          handler: () => this.printOrders(d)
        },
        {
          text: 'No',
          handler: () => this.closeModal()
        }
      ])
      }
    },
    async closeModal() {
      await modalController.dismiss({})
    },
    async printOrders(orders: any) {
      const p = new PrintoutService();
      await orders.forEach(async (element: any) => {
        const url = `lab/labels/order?order_id=${element.order_id}`
        await p.printLbl(url);
      });
      await modalController.dismiss({})
    },
  },
  computed: {
    selectedOrders(): any {
      return this.testTypes.filter((data: any) => data.isChecked === true);
    },
    finalOrders(): any {
      return this.selectedOrders.filter((data: any) => data.reason && data.specimen)
    }
  },
  mounted() {
    this.getActivities();
  },
  data() {
    return {
      content: "Content",
      appActivities: [] as Array<ActivityInterface>,
      testTypes: [] as any,
      specimens: [],
      reasons: ['Routine', 'Targeted', 'Confirmatory', 'Stat', 'Repeat / Missing'],
      activeIndex: null as any
    };
  },
  components: {
    IonButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonLabel,
    IonList,
    IonItem,
    IonCheckbox,
    IonRadioGroup,
    IonRow,
  },
});
</script>
<style scoped>
table {
  font-family: arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

td,
th {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
}

tr:nth-child(even) {
  background-color: #dddddd;
}
</style>