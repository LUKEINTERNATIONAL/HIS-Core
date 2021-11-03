<template>
  <view-port>
    <ion-grid>
      <ion-row>
        <ion-col size="4" class="side left">
          <ion-list v-for="(drug, index) in drugs" :key="index">
            <ion-item
              :color="index === selectedDrug ? 'primary' : ''"
              @click="selectDrug(index)"
            >
              {{ `${drug.drug_name ?? drug.drug_legacy_name} `   }}</ion-item
            >
          </ion-list>
        </ion-col>
        <ion-col size="8" class="side">
          <div v-if="selectedDrug !== null">
            <p class="drug-info">{{ drugs[selectedDrug].fullName }}</p>
            <table
              id="batch-table"
              style="
                border: 1.5px solid rgb(92, 166, 196);
                border-radius: 10px;
                width: 94%;
                margin-top: 20px;
                margin-left: 20px;
                padding-top: 35px;
                padding-bottom: 20px;
              "
            >
              <tr>
                <th style="width: 5%">Total tins</th>
                <th style="width: 5%">Authorization code</th>
              </tr>
              <tbody>
                <tr
                  v-for="(entry, ind) in drugs[selectedDrug].entries"
                  :key="ind"
                >
                  <td style="width: 50px; text-align: center" >
                   <input
                      class="input-field"
                      v-model="entry.tins"
                      @click="launchKeyPad('tins', ind)"
                    />
                  </td>
                  <td style="width: 50px; text-align: center">
                    <input
                      class="input-field"
                      v-model="entry.authorization"
                      @click="launchKeyPad('authorization', ind)"
                    />
                    
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ion-col>
      </ion-row>
    </ion-grid>
  </view-port>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import handleVirtualInput from "@/components/Keyboard/KbHandler";
import { NUMBERS_ONLY } from "@/components/Keyboard/HisKbConfigurations";
import ViewPort from "@/components/DataViews/ViewPort.vue";
import FieldMixinVue from "./FieldMixin.vue";
import HisDate from "@/utils/Date";
import { Service } from "@/services/service";
import {
  IonGrid,
  IonCol,
  IonRow,
  IonButton,
  modalController,
} from "@ionic/vue";
import HisDateKeyPad from "@/components/Keyboard/HisDateKeypad.vue";
import KeyBoardModal from "@/components/Keyboard/HisModalKeyboard.vue";
import { toastDanger, toastWarning } from "@/utils/Alerts";
import { isEmpty } from "lodash";
import { StockService } from "@/apps/ART/services/stock_service";
import HisKeyboardVue from "../Keyboard/HisKeyboard.vue";
import { DHAVerificationService } from "@/services/DHA_code_service"
import HisModalKeyboardVue from "@/components/Keyboard/HisModalKeyboard.vue";

export default defineComponent({
  components: { ViewPort, IonGrid, IonCol, IonRow },
  mixins: [FieldMixinVue],
  data: () => ({
    value: "",
    keyboard: NUMBERS_ONLY,
    date: "" as any,
    drugs: [] as any,
    selectedDrug: null as any,
  }),
  async activated() {
    this.$emit("onFieldActivated", this);
    this.date = new Date();
    await this.setDefaultValue();
  },
  methods: {
    async setDefaultValue() {
      const drugs = await this.options();
      this.drugs = [];
      drugs.forEach((element: any) => {
        const val = {
          tins: null,
          authorization: null
        }
        const d = {
          ...element.value,
          entries: [{...val}]
        };
        this.drugs.push(d);
      });
      if (this.defaultValue && !this.value) {
        const defaults = await this.defaultValue(this.fdata, this.cdata);
        if (defaults) {
          this.value = defaults.toString();
        }
      }
    },
    async launchKeyPad(d: any, index: any) {
      const modal = await modalController.create({
        component:  HisModalKeyboardVue,
        backdropDismiss: false,
        cssClass: "large-modal",
      });
      modal.present();
      const { data } = await modal.onDidDismiss();
      if(d === 'authorization') {

        const j = new DHAVerificationService();
        if(j.isValidDHACode(data.toUpperCase() )) {

          this.drugs[this.selectedDrug].entries[index][d] = data.toUpperCase();
        }else {
          toastDanger('Invalid authorization code');
        }
      }else {
        if (isNaN(data)) {
          toastDanger("Invalid entry for number of tins");
          return;
        }
        this.drugs[this.selectedDrug].entries[index][d] = data;
      }
      return data;
    },
    onKbValue(text: any) {
      this.value = text;
    },
    addRow() {
      this.drugs[this.selectedDrug].entries.push({
        tabs: this.drugs[this.selectedDrug].packSizes[0],
        tins: null,
        expiry: null,
        batchNumber: null,
      });
    },
    async keypress(text: any) {
      this.value = handleVirtualInput(text, this.value);
    },
    add(unit: string) {
      this.date = HisDate.add(`${this.date}`, unit, 1);
    },
    subtract(unit: string) {
      this.date = HisDate.subtract(`${this.date}`, unit, 1);
    },
    today() {
      this.date = Service.getSessionDate();
    },
    async selectDrug(index: any) {
      this.selectedDrug = index;
    },
    validateEntry(drug: any) {
      return (
        !isEmpty(drug.tins) &&
        !isEmpty(drug.authorization) 
      );
    },
  },
  computed: {
    getYear(): any {
      return HisDate.getYear(`${this.date}`);
    },
    getMonth(): any {
      return HisDate.getMonth(`${this.date}`);
    },
    getDay(): any {
      return HisDate.getDay(`${this.date}`);
    },
    fullDate(): any {
      return HisDate.toStandardHisFormat(this.date);
    },
    enteredDrugs(): any {
      const f: any = [];
      this.drugs.forEach((element: any) => {
        if(element.entries) {
          const j = element.entries.filter((el: any) => this.validateEntry(el));
          j.forEach((e: any) => {
            f.push({ label: element.shortname, value: { ...e, ...element } });
          });
        }
        
      });
      return f;
    },
  },
  watch: {
    drugs: {
        async handler() {
          this.$emit("onValue", this.enteredDrugs );
        },
        immediate: true,
        deep: true
    }
  },
});
</script>
<style scoped>
/*  */
input {
  background-color: white;
}
.drug-info {
  font-size: 1.5em;
}
.input-field {
  -webkit-transition: all 0.3s ease-in-out;
  outline: none;
  box-shadow: 0 0 5px rgba(81, 203, 238, 1);
  padding: 3px 0px 3px 3px;
  margin: 5px 1px 3px 0px;
  border: 1px solid rgba(81, 203, 238, 1);
  height: 45px;
  width: 90%;
  font-size: 26px;
  margin-left: 10px;
  text-align: center;
}
th {
  font-size: 1.3em;
}.left {
  border-right: solid;
  height: 70vh;
  overflow: scroll;
}
</style>