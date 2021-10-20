<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-row>
          <ion-col>
            <label class="his-title"> BP Drug management </label>
          </ion-col>
        </ion-row>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <view-port>
        <div class="view-port-content">
          <ion-content>
            <table id="main-table">
              <tr>
                <th>&nbsp;</th>
                <th>
                  HCZ
                  <table style="width: 100%">
                    <tr>
                      <td
                        style="
                          width: 100%;
                          border: 1px dotted lightgray;
                          border-radius: 3px;
                        "
                      >
                        <span>25mg</span>
                      </td>
                    </tr>
                  </table>
                </th>

                <th>
                  Enalapril
                  <table style="width: 100%">
                    <tr>
                      <td
                        style="
                          width: 50%;
                          border: 1px dotted lightgray;
                          border-radius: 3px;
                        "
                      >
                        <span>5mg</span>
                      </td>
                      <td
                        style="
                          width: 50%;
                          border: 1px dotted lightgray;
                          border-radius: 3px;
                        "
                      >
                        <span>10mg</span>
                      </td>
                    </tr>
                  </table>
                </th>

                <th>
                  Amlodipine
                  <table style="width: 100%">
                    <tr>
                      <td
                        style="
                          width: 50%;
                          border: 1px dotted lightgray;
                          border-radius: 3px;
                        "
                      >
                        <span>5mg</span>
                      </td>
                      <td
                        style="
                          width: 50%;
                          border: 1px dotted lightgray;
                          border-radius: 3px;
                        "
                      >
                        <span>10mg</span>
                      </td>
                    </tr>
                  </table>
                </th>

                <th>
                  Atenolol
                  <table style="width: 100%">
                    <tr>
                      <td
                        style="
                          width: 50%;
                          border: 1px dotted lightgray;
                          border-radius: 3px;
                        "
                      >
                        <span>50mg</span>
                      </td>
                      <td
                        style="
                          width: 50%;
                          border: 1px dotted lightgray;
                          border-radius: 3px;
                        "
                      >
                        <span>100mg</span>
                      </td>
                    </tr>
                  </table>
                </th>
              </tr>

              <tr>
                <td class="td-current td-title"><span>Current</span></td>

                <td class="td-current td-value">
                  <table style="width: 100%">
                    <tr>
                      <td
                        style="width: 100%"
                        v-for="(drug, i) in drugs['HCZ'].drugs"
                        :key="i"
                      >
                        <ion-checkbox
                          :checked="drug.current"
                          disabled
                        ></ion-checkbox>
                      </td>
                    </tr>
                  </table>
                </td>

                <td class="td-current td-value">
                  <table style="width: 100%">
                    <td
                      style="width: 50%"
                      v-for="(drug, i) in drugs['Enalapril'].drugs"
                      :key="i"
                    >
                      <ion-checkbox
                        :checked="drug.current"
                        disabled
                      ></ion-checkbox>
                    </td>
                    <tr></tr>
                  </table>
                </td>

                <td class="td-current td-value">
                  <table style="width: 100%">
                    <tr>
                      <td
                        style="width: 50%"
                        v-for="(drug, i) in drugs['Amlodipine'].drugs"
                        :key="i"
                      >
                        <ion-checkbox
                          :checked="drug.current"
                          disabled
                        ></ion-checkbox>
                      </td>
                    </tr>
                  </table>
                </td>

                <td class="td-current td-value">
                  <table style="width: 100%">
                    <tr>
                      <td
                        style="width: 50%"
                        v-for="(drug, i) in drugs['Atenolol'].drugs"
                        :key="i"
                      >
                        <ion-checkbox
                          :checked="drug.current"
                          disabled
                        ></ion-checkbox>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td class="td-remaining td-title">
                  <span>Pills remaining</span>
                </td>
                <td class="td-current td-value">
                  <table style="width: 100%">
                    <tr>
                      <td
                        style="width: 100%"
                        v-for="(drug, i) in drugs['HCZ'].drugs"
                        :key="i"
                      >
                        <ion-input
                          :disabled="!drug.dispensed"
                          v-model="drug.remaining"
                          @click="launchKeyPad('HCZ', i)"
                          type="number"
                        ></ion-input>
                      </td>
                    </tr>
                  </table>
                </td>

                <td class="td-current td-value">
                  <table style="width: 100%">
                    <td
                      style="width: 50%"
                      v-for="(drug, i) in drugs['Enalapril'].drugs"
                      :key="i"
                    >
                      <ion-input
                        :disabled="!drug.dispensed"
                        v-model="drug.remaining"
                        @click="launchKeyPad('Enalapril', i)"
                        type="number"
                      ></ion-input>
                    </td>
                    <tr></tr>
                  </table>
                </td>

                <td class="td-current td-value">
                  <table style="width: 100%">
                    <tr>
                      <td
                        style="width: 50%"
                        v-for="(drug, i) in drugs['Amlodipine'].drugs"
                        :key="i"
                      >
                        <ion-input
                          :disabled="!drug.dispensed"
                          v-model="drug.remaining"
                          @click="launchKeyPad('Amlodipine', i)"
                          type="number"
                        ></ion-input>
                      </td>
                    </tr>
                  </table>
                </td>

                <td class="td-current td-value">
                  <table style="width: 100%">
                    <tr>
                      <td
                        style="width: 50%"
                        v-for="(drug, i) in drugs['Atenolol'].drugs"
                        @click="launchKeyPad('Atenolol', i)"
                        :key="i"
                      >
                        <ion-input
                          :disabled="!drug.dispensed"
                          v-model="drug.remaining"
                          type="number"
                        ></ion-input>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <table id="table-notes">
              <caption style="font-size: 1.6em">
                Adherence summary
              </caption>
              <tr>
                <th style="width: 25%">
                  <span>Drug</span>
                </th>
                <th style="width: 25%">
                  <span>Pills dispensed during last visit</span>
                </th>
                <th style="width: 25%">
                  <span>Expected pills remaining</span>
                </th>
                <th style="width: 25%">
                  <span>Adherence for drug</span>
                </th>
              </tr>
              <tr
                v-for="(drug, i) in selectedDrugs"
                :key="i"
                class="dispensation-row"
              >
                <td class="date-td today-td">{{ drug.drugName }}</td>
                <td class="date-td today-td">{{ drug.dispensed }}</td>
                <td class="date-td today-td">{{ drug.expectedRemaining }}</td>
                <td class="date-td today-td">
                  {{ drug.adherence ? `${drug.adherence} %` : "?" }}
                </td>
              </tr>
            </table>
          </ion-content>
        </div>
      </view-port>
    </ion-content>
    <ion-footer>
      <ion-toolbar color="black">
        <ion-button
          size="large"
          color="danger"
          slot="start"
          @click="gotoPatientDashboard"
        >
          cancel
        </ion-button>
        <ion-button
          size="default"
          color="primary"
          slot="end"
          @click="goToPrescription"
        >
          Change BP drugs </ion-button
        ><ion-button color="success" slot="end" @click="nextTask">
          Continue without prescribing
        </ion-button>
        <ion-button color="success" slot="end" @click="onFinish">
          continue
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import ViewPort from "@/components/DataViews/ViewPort.vue";
import {
  IonToolbar,
  IonHeader,
  IonContent,
  IonRow,
  IonCol,
  IonInput,
  IonButton,
  modalController,
  IonFooter,
  IonPage,
  IonCheckbox,
} from "@ionic/vue";
import EncounterMixinVue from "./EncounterMixin.vue";
import { BPManagementService } from "../../services/htn_service";
import HisKeypadVue from "@/components/Keyboard/HisKeypad.vue";
export default defineComponent({
  mixins: [EncounterMixinVue],
  components: {
    ViewPort,
    IonToolbar,
    IonHeader,
    IonContent,
    IonRow,
    IonInput,
    IonButton,
    IonCol,
    IonFooter,
    IonPage,
    IonCheckbox,
  },
  watch: {
    patient: {
      async handler(patient: any) {
        this.HTN = new BPManagementService(this.patientID, this.providerID);
        await this.getCurrentDrugs();
      },
      deep: true,
    },
  },
  data: () => {
    return {
      HTN: {} as any,
      drugs: {
        HCZ: {
          drugs: [
            {
              drugName: "HCZ (25mg tablet)",
              drugID: 275,
              current: false,
              selected: false,
              isChecked: false,
              dispensed: null,
              expectedRemaining: null,
              adherence: null,
            },
          ],
          selected: null,
          notes: [],
        },
        Enalapril: {
          drugs: [
            {
              drugName: "Enalapril (5mg tablet)",
              drugID: 942,
              current: false,
              selected: false,
              isChecked: false,
              dispensed: null,
              expectedRemaining: null,
              adherence: null,
              remaining: null,
            },
            {
              drugName: "Enalapril (10mg tablet)",
              drugID: 943,
              current: false,
              selected: false,
              isChecked: false,
              dispensed: null,
              expectedRemaining: null,
              adherence: null,
              remaining: null,
            },
          ],
          selected: null,
          notes: [],
        },
        Amlodipine: {
          drugs: [
            {
              drugName: "Amlodipine (5mg tablet)",
              drugID: 558,
              current: false,
              selected: false,
              isChecked: false,
              dispensed: null,
              expectedRemaining: null,
              adherence: null,
              remaining: null,
            },
            {
              drugName: "Amlodipine (10mg tablet)",
              drugID: 559,
              current: false,
              selected: false,
              isChecked: false,
              dispensed: null,
              expectedRemaining: null,
              adherence: null,
              remaining: null,
            },
          ],
          selected: null,
          notes: [],
        },
        Atenolol: {
          drugs: [
            {
              drugName: "Atenolol (50mg tablet)",
              drugID: 117,
              current: false,
              selected: false,
              isChecked: false,
              dispensed: null,
              expectedRemaining: null,
              adherence: null,
              remaining: null,
            },
            {
              drugName: "Atenolol(100mg tablet)",
              drugID: 11,
              current: false,
              selected: false,
              isChecked: false,
              dispensed: null,
              expectedRemaining: null,
              adherence: null,
              remaining: null,
            },
          ],
          selected: null,
          notes: [],
        },
      } as any,
    };
  },
  methods: {
    goToPrescription() {
      this.$router.push(`/art/encounters/bp_prescription/${this.patientID}`);
    },
    async getCurrentDrugs() {
      const drugs = await this.HTN.getCurrentDrugs();
      const lastDrugs = await this.HTN.getLastDrugs();
      drugs.drugs.forEach((drug: any) => {
        for (const key in this.drugs) {
          this.drugs[key].drugs.forEach((element: any, index: any) => {
            if (drug.drug_id === element.drugID) {
              this.drugs[key].drugs[index].current = true;
              this.drugs[key].drugs[index].selected = true;
              this.drugs[key].selected = drug.drug_id;
            }
            const drugName = this.drugs[key].drugs[index].drugName;
            if (Object.prototype.hasOwnProperty.call(lastDrugs, drugName)) {
              this.drugs[key].drugs[index].expectedRemaining =
                lastDrugs[drugName].remaining;
              this.drugs[key].drugs[index].dispensed =
                lastDrugs[drugName].value_numeric;
            }
          });
        }
      });
    },
    async launchKeyPad(d: any, index: any) {
      const modal = await modalController.create({
        component: HisKeypadVue,
        backdropDismiss: false,
        cssClass: "keypad-modal",
      });
      modal.present();
      const { data } = await modal.onDidDismiss();
      const adh = await this.HTN.getAdherence(
        this.drugs[d].drugs[index].drugID,
        data
      );
      this.drugs[d].drugs[index].adherence = adh.adherence;
      this.drugs[d].drugs[index].remaining = data;
      return data;
    },
  },
  computed: {
    selectedDrugs(): any {
      let drugs: any = [];
      Object.keys(this.drugs).forEach((d: any) => {
        const dr = this.drugs[d].drugs.filter((d: any) => d.dispensed);
        drugs = [...drugs, ...dr];
      });
      return drugs;
    },
  },
});
</script>
<style scoped>
ion-checkbox {
  --size: 30px;
}
ion-input {
  background-color: white;
  border: solid 1px black;
}

.holder {
  width: 99%;
  padding: 1.5%;
}

.dispensation-row {
  text-align: center;
  font-size: 1.6em;
}

#main-table,
#table-notes {
  width: 95%;
  margin: auto;
}

#main-table th,
#table-notes th {
  font-size: 20px;
  background-color: firebrick;
  color: white;
}

#main-table th,
#main-table td {
  text-align: center;
  padding: 10px;
}

.td-title {
  font-size: 22px;
  text-shadow: 2px 2px white;
}

.td-title,
.td-current,
.td-remaining {
  padding: 2px !important;
}

.td-current {
  background-color: #eed5d2;
  text-shadow: 2px 2px white;
  height: 40px !important;
}

.td-remaining {
  background-color: #ffe5e5;
  text-shadow: 2px 2px white;
}

.td-value {
  font-size: 22px;
}

#table-notes td {
  background: rgba(210, 220, 240, 0.5);
  border-radius: 5px;
}

#table-notes th {
  background: lightgray;
  color: rgba(0, 0, 0, 0.8);
}

#table-notes td {
  padding-left: 1px;
}

.date-td {
  padding-left: 4px !important;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  font-size: 1em;
  background: rgba(235, 235, 240, 0.5) !important;
  color: rgba(0, 0, 0, 0.9);
  text-align: center;
}

.note-td {
  padding-left: 20px !important;
  color: rgba(0, 0, 0, 0.8);
  text-shadow: 2px 2px 3px rgba(255, 255, 255, 0.1);
}

.today-tr {
  font-style: italic;
  font-weight: bold;
  border-radius: 10px !important;
}
</style>