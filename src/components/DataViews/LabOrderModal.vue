<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Lab orders</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content :style="{ overflowY: 'hidden', background: 'grey' }" >
    <ion-grid>
      <ion-row>
        <ion-col size="6">
          <ion-list :style="{overflowY: 'auto', height:'78vh'}"> 
            <ion-item 
              v-for="(data, index) in testTypes" 
              :key="data"
              :disabled="activeIndex !== null && activeIndex !== index && !isOrderComplete" 
              detail
            > 
              <ion-label> {{ data.name }} </ion-label>
              <ion-checkbox 
                v-model="data.isChecked" 
                slot="start" 
                @ionChange="(e) => onSelectTest(data.name, index, e)"
              />
            </ion-item>
          </ion-list>
        </ion-col>
        <ion-col :style="{overflowY: 'auto', height:'78vh'}" v-if="activeIndex != null && selectedOrders.length > 0">
          <div class="ion-margin-bottom">
            <ion-list v-if="!extendedLabsEnabled">   
              <ion-radio-group v-model="testTypes[activeIndex]['specimen']">
                <div class="side-title">
                  Select specimen
                </div>
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
              <ion-item v-for="data in reasons" :key="data"> 
                <ion-label>{{data}}</ion-label>
                <ion-radio slot="start" :value="data" ></ion-radio>
              </ion-item>
            </ion-radio-group>
          </div>
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
                  <td>{{data.specimen || 'N/A'}}</td>
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
import { alertConfirmation, toastWarning } from "@/utils/Alerts"
import { ActivityInterface } from "@/apps/interfaces/AppInterface"
import { OrderService } from "@/services/order_service";
import { LabOrderService } from "@/apps/ART/services/lab_order_service";
import { PrintoutService } from "@/services/printout_service";
import ART_GLOBAL_PROP from "@/apps/ART/art_global_props"
import { isEmpty } from "lodash";

export default defineComponent({
  name: "Modal",
  props: {
    activities: {
      type: Object as PropType<ActivityInterface[]>,
      required: true
    },
    testFilters: {
      type: Array    
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
  async created() {
    this.extendedLabsEnabled = await ART_GLOBAL_PROP.extendedLabEnabled()
  },
  methods: {
    async onSelectTest(testName: string, index: number, event: any) {
      this.$nextTick(async () => {
        this.testTypes[index]['isChecked'] = event.target.checked;
        if(this.testTypes[index]['isChecked']){
          this.specimens = await OrderService.getSpecimens(testName);
          this.testTypes[index]['currentIndex'] = index;
          this.activeIndex = index;
        } else {
          this.removeOrder(index)
        }
      })
    },
    async getActivities() {
     const tests = await OrderService.getTestTypes();
     this.testTypes = tests.map((t: any, i: any) => {
        t.index = t.name === 'HIV viral load' ? (t.index = 0) : (t.index = i + 1)
        return t
     })
     .sort((a: any, b: any) => a.index < b.index ? 0 : 1)
     .filter((t: any) => Array.isArray(this.testFilters) ? this.testFilters.includes(t.name) : true)
    },
    removeOrder(index: number) {
      this.testTypes[index]['isChecked'] = false;
      this.testTypes[index]['reason'] = null;
      this.testTypes[index]['specimen'] = null;
      this.testTypes[index]['specimenConcept'] = null
      this.activeIndex = null
      this.specimens = []
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
        
        if(!d) return toastWarning('Unable to save lab orders')

        const canPrintOrders = await alertConfirmation(
          'Lab orders and encounter created!, print out your last orders?', 
          'Confirmation',
          { 
            confirm: 'Yes',
            cancel: 'No'
          }
        )
        if(canPrintOrders) await this.printOrders(d)
        else await this.closeModal(d)
      }
    },
    async closeModal(orders: []) {
      await modalController.dismiss(orders)
    },
    async printOrders(orders: any) {
      const p = new PrintoutService();
      await orders.forEach(async (element: any) => {
        const url = `lab/labels/order?order_id=${element.order_id}`
        await p.printLbl(url);
      });
      await modalController.dismiss(orders)
    },
  },
  computed: {
    isOrderComplete(): boolean {
      return (this.testTypes[this.activeIndex]['specimenConcept'] || this.testTypes[this.activeIndex]['specimen']) 
        && this.testTypes[this.activeIndex]['reason'] 
    },
    selectedOrders(): any {
      return this.testTypes.filter((data: any) => data.isChecked === true);
    },
    finalOrders(): any {
      return this.selectedOrders.filter((data: any) => {
        return data.reason && (data.specimen && !this.extendedLabsEnabled 
          || this.extendedLabsEnabled)
      } )
    }
  },
  mounted() {
    this.getActivities();
  },
  data() {
    return {
      content: "Content",
      extendedLabsEnabled: false as boolean,
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
ion-col {
  border-right: solid 1px #ccc;
}
.side-title {
  width: 100%;
  padding: 0.5em;
  text-align: center;
  background: rgb(233, 232, 232);
  font-size: 1.2em;
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