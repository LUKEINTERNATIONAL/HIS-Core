<template>
  <view-port>
    <his-text-input readonly :value="fullSelectedDrugName"/> 
    <ion-grid style="background: white;">
      <ion-row>
        <ion-col size="4" class="border-right scroll-list">
          <ion-list v-for="(drug, index) in drugs" :key="index">
            <ion-item
              detail
              :color="index === selectedDrug ? 'secondary' : ''"
              @click="selectDrug(index)">
              {{ `${drug.shortName} (${drug.packSizes[0]})` }}
            </ion-item>
          </ion-list>
        </ion-col>
        <ion-col>
          <ion-grid v-if="selectedDrug !== null" class="scroll-list"> 
            <h3 class="his-card" v-if="noStockForDrug"> No stock information available for drug</h3>
            <ion-row v-for="(entry, ind) in drugs[selectedDrug].entries" :key="ind"> 
              <ion-col> 
                <ion-item>
                  <ion-label position="floating">Expiry Date</ion-label>
                  <ion-input readonly :value="entry.expiry_date"></ion-input>
                </ion-item>
              </ion-col>
              <ion-col> 
                <ion-item>
                  <ion-label position="floating">Available Tins</ion-label>
                  <ion-input 
                    readonly 
                    placeholder="0"
                    :value="entry.current_quantity"
                    :color="entry.current_quantity != entry.originalQuantity ? 'success': ''">
                  </ion-input>
                </ion-item>
              </ion-col>
              <ion-col> 
                <ion-button size="large" @click="enterAmount(ind)"> Update Stock </ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-col>
      </ion-row>
    </ion-grid>
  </view-port>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonGrid,
  IonCol,
  IonRow,
  IonButton,
  modalController,
} from "@ionic/vue";
import { StockService } from "@/apps/ART/views/ARTStock/stock_service";
import ViewPort from "@/components/DataViews/ViewPort.vue";
import FieldMixinVue from "./FieldMixin.vue";
import { Field, Option } from "../Forms/FieldInterface";
import TouchField from "@/components/Forms/SIngleTouchField.vue"
import Validation from "@/components/Forms/validations/StandardValidations"
import { FieldType } from "../Forms/BaseFormElements";
import HisTextInput from "@/components/FormElements/BaseTextInput.vue";
import { isEmpty } from "lodash";

export default defineComponent({
  components: { ViewPort, HisTextInput, IonGrid, IonCol, IonRow, IonButton },
  mixins: [FieldMixinVue],
  data: () => ({
    drugs: [] as any,
    selectedDrug: null as any,
    stockService: {} as any,
  }),
  async activated() {
    this.$emit("onFieldActivated", this);
    this.stockService = new StockService();
    await this.setDefaultValue();
  },
  methods: {
    async setDefaultValue() {
      if (!isEmpty(this.drugs)) {
        return
      }
      const drugs = await this.options();
      this.drugs = [];
      drugs.forEach((element: any) => {
        this.drugs.push({ ...element.value });
      });
    },
    getModalTitle(context: string) {
      return `${context} (${this.drugs[this.selectedDrug].fullName})`
    },
    getDrugValue(index: number, type: string) {
      return this.drugs[this.selectedDrug].entries[index][type]
    },
    setDrugValue(index: number, type: string, data: Option | null) {
      this.drugs[this.selectedDrug].entries[index][type] = data ? data.value : ''

    },
    async enterAmount(index: number) {
      this.launchKeyPad({
        id: 'tins',
        helpText: this.getModalTitle('Enter number of tins'),
        type: FieldType.TT_NUMBER,
        defaultValue: () => this.getDrugValue(index, 'current_quantity'),
        validation: (v: Option) => {
          if (!v || v && !v.value) return null
          return Validation.validateSeries([
            () => Validation.isNumber(v),
            () => v.value < 0 ? ['Number of tins must be greater than 1'] : null
          ])
        }
      },
      (v: Option) => {
        this.setDrugValue(index, 'current_quantity', v)
      })
    },
    async launchKeyPad(currentField: Field, onFinish: Function) {
      const modal = await modalController.create({
        component: TouchField,
        backdropDismiss: false,
        cssClass: "full-modal",
        componentProps: {
          dismissType: 'modal',
          currentField,
          onFinish
        }
      });
      modal.present();
    },
    async selectDrug(index: any) {
      this.selectedDrug = index;
      const vals = await this.stockService.getItem(
        this.drugs[this.selectedDrug].drugID
      )
      this.drugs[index]["entries"] = vals.map((i: any) => {
        i.originalQuantity = i['current_quantity']
        return i
      })
    }
  },
  computed: {
    noStockForDrug(): boolean {
      try {
        return !this.drugs[this.selectedDrug].entries || this.drugs[this.selectedDrug].entries.length <= 0
      }catch(e) {
        return false
      }
    },
    fullSelectedDrugName(): string {
      try {
        return this.drugs[this.selectedDrug].fullName
      } catch (e) {
        return 'N/A'
      }
    },
    enteredDrugs(): any {
      const f: any = [];
      this.drugs.forEach((element: any) => {
        if (element.entries) {
          const j = element.entries.filter((el: any) => el.current_quantity != el.originalQuantity);
          j.forEach((e: any) => {
            f.push({ label: element.shortname, value: { ...e, ...element } });
          });
        }
      });
      return f;
    },
  },
  watch: {
    clear() {
      this.drugs = this.drugs.map((d: any) => {
        if (!d.entries) return d
        d.entries = d.entries.map((e: any) => {
          e['current_quantity'] = e.originalQuantity
          return e
        })
        return d
      })
    },
    drugs: {
      async handler() {
        this.$emit("onValue", this.enteredDrugs);
      },
      immediate: true,
      deep: true,
    },
  },
});
</script>
<style scoped>
.border-right {
  border-right: solid 1px #ccc;
}
.scroll-list {
  height: 70vh;
  overflow: auto;
}
.input_display {
  font-size: 1.3em;
}
</style>