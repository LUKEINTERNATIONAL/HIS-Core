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
            <ion-row v-for="(entry, ind) in drugs[selectedDrug].entries" :key="ind"> 
              <ion-col> 
                <ion-item> 
                  <ion-label position="floating">Total Tins</ion-label>
                  <ion-input readonly placeholder="0" :value="entry.tins" @click="enterTins(ind)"></ion-input>
                </ion-item>
              </ion-col>
              <ion-col> 
                <ion-item> 
                  <ion-label position="floating">Expiry Date</ion-label>
                  <ion-input readonly placeholder="YYYY/MM/DD" :value="entry.expiry" @click="enterExpiry(ind)"></ion-input>
                </ion-item>
              </ion-col>
              <ion-col> 
                <ion-item> 
                  <ion-label position="floating">Batch Number</ion-label>
                  <ion-input readonly placeholder="ABC-123" :value="entry.batchNumber" @click="enterBatch(ind)"></ion-input>
                </ion-item>
              </ion-col>
            </ion-row>
            <ion-row> 
              <ion-col>
                <ion-button @click="addRow" siz="large">Add row</ion-button>
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
import ViewPort from "@/components/DataViews/ViewPort.vue";
import FieldMixinVue from "./FieldMixin.vue";
import {
  IonGrid,
  IonCol,
  IonRow,
  IonButton,
  IonList,
  IonInput,
  IonLabel,
  IonItem,
  modalController,
} from "@ionic/vue";
import { find, isEmpty } from "lodash";
import TouchField from "@/components/Forms/SIngleTouchField.vue"
import { Field, Option } from "../Forms/FieldInterface";
import { FieldType } from "../Forms/BaseFormElements";
import Validation from "@/components/Forms/validations/StandardValidations"
import { Service } from "@/services/service";
import HisTextInput from "@/components/FormElements/BaseTextInput.vue";

export default defineComponent({
  components: { HisTextInput, ViewPort, IonInput, IonLabel, IonList, IonItem, IonGrid, IonCol, IonRow, IonButton },
  mixins: [FieldMixinVue],
  data: () => ({
    drugs: [] as any,
    allDrugsByName: [] as string[],
    selectedDrug: null as any,
  }),
  async activated() {
    this.$emit("onFieldActivated", this);
    await this.setDefaultValue();
  },
  methods: {
    async setDefaultValue() {
      const incomingDrugs = await this.options();
      // detect if some drugs are still available as options
      this.drugs = this.drugs.filter((d: any) =>
        incomingDrugs.map((i: any) => i.label).includes(d.label)
      )
      incomingDrugs.forEach((element: any) => {
        const val = {
          tabs: element.value.packSizes[0],
          tins: null,
          expiry: null,
          batchNumber: null,
        };
        const d = {
          label: element.label,
          entries: [{ ...val }, { ...val }, { ...val }],
          ...element.value,
        };
        // Append if incoming drug is new
        const drugExists = find(this.drugs, { label: element.label })
        if (!drugExists) this.drugs.push(d)
      })
      // initialise drug selection
      if (this.drugs.length >= 1) this.selectDrug(0)
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
        validation: (v: Option) => Validation.validateSeries([
          () => Validation.required(v),
          () => Validation.isNumber(v),
          () => v.value <= 0 ? ['Number of tins must be greater than 1'] : null
        ])
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
        validation: (v: Option) => Validation.validateSeries([
          () => Validation.required(v),
          () => new Date(v.value) < new Date(Service.getSessionDate()) 
            ? ['You are not allowed to enter expired drugs']
            : null
        ])
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
    clear() {
      this.drugs = this.drugs.map((d: any) => {
        d.entries = d.entries.map((e: any) => {
          e.tins = null
          e.expiry = null
          e.batchNumber = null
          return e
        })
        return d
      })
    },
    drugs: {
      handler() {
        if (this.enteredDrugs.length != this.drugs.length) {
          this.$emit('onValue', null)
          return
        }
        this.$emit("onValue", this.enteredDrugs )
      },
      immediate: true,
      deep: true
    }
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
  font-size: 1.0em;
}
</style>