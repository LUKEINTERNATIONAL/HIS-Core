<template>
  <view-port>
    <div class="view-port-content">
      <ion-header>
        <ion-toolbar
          ><span>BP management screening on {{ date }}</span>
          <span slot="end"><ion-button @click="showRiskFactors">View/Edit riskfactors {{totalRiskFactors}}</ion-button></span>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div>
          <ion-grid>
            <ion-row >
              <his-table :columns="columns" :rows="rows"></his-table>
            </ion-row>
            <ion-row style="margin-top: 40vh">
              <ion-radio-group v-model="action">
              <ion-grid>
                <ion-row>

                <ion-col size="4">
  <ion-item>
                      <ion-label>Lifestyle advice given</ion-label>
                      <ion-radio value="lifestyle advice given"></ion-radio>
                  </ion-item>
                </ion-col>
                <ion-col size="4">

                  <ion-item>
                      <ion-label>not yet stable on ART</ion-label>
                      <ion-radio value="not yet stable"></ion-radio>
                  </ion-item>
                </ion-col>
                <ion-col size="4">

                  <ion-item>
                      <ion-label>Patient declining BP drugs</ion-label>
                      <ion-radio value="patient declining BP drugs"></ion-radio>
                  </ion-item>
                </ion-col>
                <ion-col size="4">

                  <ion-item>
                      <ion-label>Start anti-hypertensives</ion-label>
                      <ion-radio value="start anti-hypertensives"></ion-radio>
                  </ion-item>
                </ion-col>
                </ion-row>
              </ion-grid>
              </ion-radio-group>
                
            </ion-row>
          </ion-grid>
        </div>
      </ion-content>
    </div>
  </view-port>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import HisTable from "@/components/DataViews/HisBasicTable.vue";
import ViewPort from "@/components/DataViews/ViewPort.vue";
import { isEmpty } from "lodash";
import FieldMixinVue from "./FieldMixin.vue";
import { IonToolbar, IonHeader, IonContent, IonGrid, IonRow, IonCol, IonRadioGroup, IonRadio, IonButton, modalController} from "@ionic/vue"
import RiskFactorModal from "../DataViews/RiskFactorModal.vue";
import { ConceptService } from "@/services/concept_service";
import { ObservationService } from "@/services/observation_service";
export default defineComponent({
  components: { ViewPort, HisTable, IonToolbar, IonHeader, IonContent, IonGrid, IonRow,  IonButton, IonRadioGroup, IonRadio},
  mixins: [FieldMixinVue],
  data: () => ({
    columns: ['Date', 'Systolic', 'Diastolic', 'BP Drugs', 'Action / Note'] as Array<string>,
    rows: [] as Array<string>,
    rowColors: [] as Array<any>,
    cellColors: [] as Array<any>,
    styles: [] as Array<string>,
    patientID: 0 as any,
    riskFactors: [] as any,
    action: null as any
  }),
  async activated() {
    const data = await this.options(this.fdata, this.cdata, this);
    if (isEmpty(data)) return;
    this.patientID = this.$route.params.patient_id;
    this.riskFactors = await this.getRiskFactors();
  },
  computed: {
     totalRiskFactors(): any {
       return this.riskFactors.filter((d: any) => d.value === "Yes").length;
     }
   },
 methods: {
   async getRiskFactors() {
    const concepts = ConceptService.getConceptsByCategory('risk factors');
    const j = concepts.map(async concept => {
      const val = await ObservationService.getFirstValueCoded(this.patientID, concept.name)
      return {
        concept: concept.name,
        value: val
      }
    })
    return Promise.all(j);
   },
   
async showRiskFactors() {
      const modal = await modalController.create({
        component: RiskFactorModal,
        backdropDismiss: false,
        cssClass: 'large-modal',
        componentProps: {
         factors: this.riskFactors
        }
      })
      modal.present()
      const { data } = await modal.onDidDismiss()
      if (!isEmpty(data)) {
        this.riskFactors = data.map((d: any) => {
          const val = d.isChecked === true ? 'Yes' : 'No';
          return {
            concept: d.concept,
            value: val
          }
        });
        // this.rows = [...this.formatOrders(data), ...this.rows]
      }
  }
 } 
});
</script>
<style scoped>
.view-port-content {
  background: white !important;
}
</style>