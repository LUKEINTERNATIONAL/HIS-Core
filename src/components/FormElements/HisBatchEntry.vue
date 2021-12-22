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
              {{ `${drug.shortName} (${drug.packSizes[0]})` }}</ion-item
            >
          </ion-list>
        </ion-col>
        <ion-col size="8" class="side">
          <div v-if="selectedDrug !== null">
            <p class="drug-info">{{ fullSelectedDrugName }}</p>
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
                <th style="width: 5%; display: none">Tabs Per Tin</th>
                <th style="width: 5%">Total tins</th>
                <th style="width: 5%">Date Of Expiry</th>
                <th style="width: 5%">Batch Number</th>
              </tr>
              <tbody>
                <tr
                  v-for="(entry, ind) in drugs[selectedDrug].entries"
                  :key="ind"
                >
                  <td style="width: 50px; text-align: center; display: none">
                    <input
                      class="input-field"
                      v-model="entry.tabs"
                      @click="enterTabs(ind)"
                    />
                  </td>
                  <td style="width: 50px; text-align: center">
                    <input
                      class="input-field"
                      v-model="entry.tins"
                      @click="enterTins(ind)"
                      field_type="total_tins"
                    />
                  </td>
                  <td style="width: 50px; text-align: center">
                    <input
                      class="input-field"
                      @click="enterExpiry(ind)"
                      v-model="entry.expiry"
                    />
                  </td>
                  <td style="width: 50px; text-align: center">
                    <input
                      class="input-field"
                      @click="enterBatch(ind)"
                      v-model="entry.batchNumber"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <br />
            <ion-button @click="addRow" siz="large">Add row</ion-button>
          </div>
        </ion-col>
      </ion-row>
    </ion-grid>
  </view-port>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ViewPort from "@/components/DataViews/ViewPort.vue";
import FieldMixinVue from "./FieldMixin.vue";
import {
  IonGrid,
  IonCol,
  IonRow,
  IonButton,
  IonList,
  IonItem,
  modalController,
} from "@ionic/vue";
import { isEmpty } from "lodash";
import TouchField from "@/components/Forms/SIngleTouchField.vue"
import { Field, Option } from "../Forms/FieldInterface";
import { FieldType } from "../Forms/BaseFormElements";
import Validation from "@/components/Forms/validations/StandardValidations"

export default defineComponent({
  components: { ViewPort, IonList, IonItem, IonGrid, IonCol, IonRow, IonButton },
  mixins: [FieldMixinVue],
  data: () => ({
    value: "",
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
          tabs: element.value.packSizes[0],
          tins: null,
          expiry: null,
          batchNumber: null,
        };
        const d = {
          ...element.value,
          entries: [{ ...val }, { ...val }, { ...val }],
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
    getModalTitle(context: string) {
      return `${context} (${this.drugs[this.selectedDrug].shortName})`
    },
    getDrugValue(index: number, type: string) {
      return this.drugs[this.selectedDrug].entries[index][type]
    },
    setDrugValue(index: number, type: string, value: number | string | undefined | null) {
      this.drugs[this.selectedDrug].entries[index][type] = value
    },
    enterTabs(index: number) {
      this.launchKeyPad({
        id: 'tabs',
        helpText: this.getModalTitle('Enter tabs'),
        type: FieldType.TT_NUMBER,
        defaultValue: () => this.getDrugValue(index, 'tabs'),
        validation: (v: Option) => Validation.required(v)
      }, 
      ({value}: Option) => this.setDrugValue(index, 'tabs', value))
    },
    enterTins(index: number) {
      this.launchKeyPad({
        id: 'tins',
        helpText: this.getModalTitle('Enter number of tins'),
        type: FieldType.TT_NUMBER,
        defaultValue: () => this.getDrugValue(index, 'tins'),
        validation: (v: Option) => Validation.required(v)
      }, 
      ({value}: Option) => this.setDrugValue(index, 'tins', value))
    },
    enterBatch(index: number) {
      this.launchKeyPad({
        id: 'batch',
        helpText: this.getModalTitle('Enter batch number'),
        type: FieldType.TT_TEXT,
        defaultValue: () => this.getDrugValue(index, 'batchNumber'),
        validation: (v: Option) => Validation.required(v)
      }, 
      ({value}: Option) => this.setDrugValue(index, 'batchNumber', value))
    },
    enterExpiry(index: number) {
      this.launchKeyPad({
        id: 'expiry',
        helpText: this.getModalTitle('Enter expiry date'),
        type: FieldType.TT_FULL_DATE,
        defaultValue: () => this.getDrugValue(index, 'expiry'),
        validation: (v: Option) => Validation.required(v)
      }, 
      ({value}: Option) => this.setDrugValue(index, 'expiry', value))
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
    addRow() {
      this.drugs[this.selectedDrug].entries.push({
        tabs: this.drugs[this.selectedDrug].packSizes[0],
        tins: null,
        expiry: null,
        batchNumber: null,
      });
    },
    selectDrug(index: any) {
      this.selectedDrug = index;
    },
    validateEntry(drug: any) {
      return (
        !isEmpty(drug.tins) &&
        !isEmpty(drug.expiry) &&
        !isEmpty(drug.batchNumber)
      );
    },
  },
  computed: {
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
        const j = element.entries.filter((el: any) => this.validateEntry(el));
        j.forEach((e: any) => {
          f.push({label: element.shortName, value: { ...e, ...element }});
        });
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
}
.left {
  border-right: solid;
  height: 70vh;
  overflow: scroll;
}
</style>