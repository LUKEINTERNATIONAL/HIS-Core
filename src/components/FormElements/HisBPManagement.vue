<template>
  <view-port>
    <div class="view-port-content">
      <ion-header>
        <ion-toolbar
          ><span>BP management screening on {{ date }}</span>
          <span slot="end"><ion-button @click="showRiskFactors">View/Edit riskfactors</ion-button></span>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div>
          <ion-grid>
            <ion-row>
              <his-table :columns="columns" :rows="rows"></his-table>
            </ion-row>
            <ion-row>
              <div>
                <p>Select action</p>
              </div>
              <div>
                  <ion-item>
                      <ion-label>Lifestyle advice given</ion-label>
                      <ion-checkbox></ion-checkbox>
                  </ion-item>
                  <ion-item>
                      <ion-label>not yet stable on ART</ion-label>
                      <ion-checkbox></ion-checkbox>
                  </ion-item>
                  <ion-item>
                      <ion-label>Patient declining BP drugs</ion-label>
                      <ion-checkbox></ion-checkbox>
                  </ion-item>
                  <ion-item>
                      <ion-label>Start anti-hypertensives</ion-label>
                      <ion-checkbox></ion-checkbox>
                  </ion-item>
                
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
export default defineComponent({
  components: { ViewPort, HisTable, IonToolbar, IonHeader, IonContent, IonGrid, IonRow,  IonCheckbox, IonButton},
  mixins: [FieldMixinVue],
  data: () => ({
    columns: ['Date', 'Systolic', 'Diastolic', 'BP Drugs', 'Action / Note'] as Array<string>,
    rows: [] as Array<string>,
    rowColors: [] as Array<any>,
    cellColors: [] as Array<any>,
    styles: [] as Array<string>,
  }),
  async activated() {
    const data = await this.options(this.fdata, this.cdata, this);
    if (isEmpty(data)) return;

    // const { other } = data[0];
    // this.columns = other.columns;
    // this.rows = other.rows;
    // this.rowColors = other.rowColors;
    // this.cellColors = other.cellColors;
    // this.styles = this.config ? this.config.styles : [];
  },
 methods: {
async showRiskFactors() {
      const modal = await modalController.create({
        component: RiskFactorModal,
        backdropDismiss: false,
        cssClass: 'large-modal'
      })
      modal.present()
      const { data } = await modal.onDidDismiss()
      if (!isEmpty(data)) {
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