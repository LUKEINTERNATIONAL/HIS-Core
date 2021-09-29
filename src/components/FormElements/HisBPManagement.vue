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
            <ion-row style="height: 70%">
              <his-table :columns="columns" :rows="rows"></his-table>
            </ion-row>
            <ion-row style="height: 30%">
              <ion-grid>
                <ion-col size="3">
  <ion-item>
                      <ion-label>Lifestyle advice given</ion-label>
                      <ion-checkbox></ion-checkbox>
                  </ion-item>
                </ion-col>
                <ion-col size="3">

                  <ion-item>
                      <ion-label>not yet stable on ART</ion-label>
                      <ion-checkbox></ion-checkbox>
                  </ion-item>
                </ion-col>
                <ion-col size="3">

                  <ion-item>
                      <ion-label>Patient declining BP drugs</ion-label>
                      <ion-checkbox></ion-checkbox>
                  </ion-item>
                </ion-col>
                <ion-col size="3">

                  <ion-item>
                      <ion-label>Start anti-hypertensives</ion-label>
                      <ion-checkbox></ion-checkbox>
                  </ion-item>
                </ion-col>
              </ion-grid>
              <div>
                
                
              </div>
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
import { IonToolbar, IonHeader, IonContent, IonGrid, IonRow, IonCol, IonCheckbox, IonButton, modalController} from "@ionic/vue"
import RiskFactorModal from "../DataViews/RiskFactorModal.vue";
import { ConceptService } from "@/services/concept_service";
import { ObservationService } from "@/services/observation_service";
export default defineComponent({
  components: { ViewPort, HisTable, IonToolbar, IonHeader, IonContent, IonGrid, IonRow,  IonCheckbox, IonButton},
  mixins: [FieldMixinVue],
  data: () => ({
    columns: ['Date', 'Systolic', 'Diastolic', 'BP Drugs', 'Action / Note'] as Array<string>,
    rows: [] as Array<string>,
    rowColors: [] as Array<any>,
    cellColors: [] as Array<any>,
    styles: [] as Array<string>,
    patientID: 0 as any,
    riskFactors: [] as any
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