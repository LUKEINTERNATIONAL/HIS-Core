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
              @click="selectDrug(index)"
            >
              {{ `${drug.drug_name ?? drug.drug_legacy_name}` }}
            </ion-item>
          </ion-list>
        </ion-col>
        <ion-col>
          <ion-grid v-if="selectedDrug !== null" class="scroll-list"> 
            <ion-row v-for="(entry, ind) in drugs[selectedDrug].entries" :key="ind"> 
              <ion-col> 
                <ion-item>
                  <ion-label position="floating">Total Tins</ion-label>
                  <ion-input 
                    readonly 
                    placeholder="0" 
                    :value="entry.tins" 
                    @click="enterTins(ind)">
                  </ion-input>
                </ion-item>
              </ion-col>
              <ion-col> 
                <ion-item> 
                  <ion-label position="floating">Authorisation code</ion-label>
                  <ion-input 
                    readonly 
                    placeholder="***********" 
                    :value="entry.authorization" 
                    @click="enterAuth(ind)">
                  </ion-input>
                </ion-item>
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
  IonList,
  IonItem,
  modalController,
} from "@ionic/vue";
import { find, isEmpty } from "lodash";
import { DHAVerificationService } from "@/services/DHA_code_service"
import { FieldType } from "../Forms/BaseFormElements";
import Validation from "@/components/Forms/validations/StandardValidations"
import { Field, Option } from "../Forms/FieldInterface";
import HisTextInput from "@/components/FormElements/BaseTextInput.vue";
import TouchField from "@/components/Forms/SIngleTouchField.vue"

export default defineComponent({
  components: { 
    ViewPort, 
    IonGrid,
    IonList,
    IonCol, 
    IonRow,
    IonItem ,
    HisTextInput
  },
  mixins: [FieldMixinVue],
  data: () => ({
    drugs: [] as any,
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
          tins: null,
          authorization: null,
        };
        const d = {
          label: element.label,
          entries: [{ ...val }],
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
      return `${context} (${this.drugs[this.selectedDrug].label})`
    },
    getDrugValue(index: number, type: string) {
      return this.drugs[this.selectedDrug].entries[index][type]
    },
    setDrugValue(index: number, type: string, data: Option | null) {
      this.drugs[this.selectedDrug].entries[index][type] = data ? data.value : ''
    },
    enterAuth(index: number) {
      this.launchKeyPad({
        id: 'auth',
        helpText: this.getModalTitle('Enter Authorization'),
        type: FieldType.TT_TEXT,
        defaultValue: () => this.getDrugValue(index, 'authorization'),
        validation: (v: Option) => {
          if (!v || v && !v.value) {
            return null
          }
          const value = v.value as string
          const dha = new DHAVerificationService()
          return !dha.isValidDHACode(value.toUpperCase())
            ? ['Invalid authorization code']
            : null
        }
      }, 
      (v: Option) => {
        const auth = {...v}
        auth.value = `${v.value}`.toUpperCase()
        auth.label = `${v.label}`.toUpperCase()
        this.setDrugValue(index, 'authorization', auth)
      })
    },
    enterTins(index: number) {
      this.launchKeyPad({
        id: 'tins',
        helpText: this.getModalTitle('Enter number of tins'),
        type: FieldType.TT_NUMBER,
        defaultValue: () => this.getDrugValue(index, 'tins'),
        validation: (v: Option) => {
          if (!v || v && !v.value) {
            return null
          } 
          return Validation.validateSeries([
            () => Validation.isNumber(v),
            () => v.value <= 0 ? ['Number of tins must be greater than 1'] : null
          ])
        }
      }, 
      (v: Option) => this.setDrugValue(index, 'tins', v))
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
    },
    validateEntry(drug: any) {
      return (
        !isEmpty(drug.tins) &&
        !isEmpty(drug.authorization) 
      );
    },
  },
  computed: {
    fullSelectedDrugName(): string {
      try {
        return this.drugs[this.selectedDrug].label
      } catch (e) {
        return 'N/A'
      }
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
    clear() {
      this.drugs = this.drugs.map((d: any) => {
        d.entries = d.entries.map((e: any) => {
          e.tins = null
          e.authorization = null
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
        deep: true
    }
  },
});
</script>
<style scoped>
ion-label {
  font-weight: bold;
}
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