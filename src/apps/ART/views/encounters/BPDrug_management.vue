<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-row>
          <ion-col>
            <label class="his-title"> Prescribe BP drugs </label>
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
                <td class="td-remaining td-title"><span>New</span></td>
                <td class="td-current td-value">
                  <table style="width: 100%">
                    <tr>
                      <td
                        style="width: 100%"
                        v-for="(drug, i) in drugs['HCZ'].drugs"
                        :key="i"
                      >
                        <ion-checkbox :checked="drug.selected" 
                        @ionChange="selectDrug('HCZ', i, $event)"
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
                      <ion-checkbox :checked="drug.selected"
                        @ionChange="selectDrug('Enalapril', i, $event)"
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
                        <ion-checkbox :checked="drug.selected"
                        @ionChange="selectDrug('Amlodipine', i, $event)"
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
                        <ion-checkbox :checked="drug.selected"
                        @ionChange="selectDrug('Atenolol', i, $event)"
                        ></ion-checkbox>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td class="td-remaining td-title">
                  <span>&nbsp;</span>
                </td>

                <td
                  class="td-remaining td-value"
                  v-for="(drug, ind) in Object.keys(drugs)"
                  :key="ind"
                >
                  <table style="width: 100%">
                    <tr>
                      <td
                        colspan="1"
                        style="
                          max-height: 20px !important;
                          margin: 0px !important;
                          padding: 0px !important;
                          height: 15px !important;
                        "
                      >
                        <div
                          class="button button-success"
                          id="alert_HCZ (25mg tablet)"
                          @click="launchKeyPad(drug)"
                        >
                          Add notes
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <table id="table-notes">
              <caption style="font-size: 1.2em">
                Notes
              </caption>
              <tr>
                <th style="width: 25%">
                  <span>HCZ</span>
                </th>
                <th style="width: 25%">
                  <span>Enalapril</span>
                </th>
                <th style="width: 25%">
                  <span>Amlodipine</span>
                </th>
                <th style="width: 25%">
                  <span>Atenolol</span>
                </th>
              </tr>
              <tr>
                <td
                  id="HCZ"
                  style="padding-top: 2px !important"
                  valign="top"
                  v-for="(drug, ind) in Object.keys(drugs)"
                  :key="ind"
                >
                  <table class="table-inner-notes" id="notes-HCZ">
                    <tr v-for="(note, i) in drugs[drug].notes" :key="i">
                      <td class="date-td today-td">{{ note.date }}</td>
                      <td class="date-td today-td">{{ note.description }}</td>
                      <td>
                        <ion-button color="danger" @click="removeNote(drug, i)"
                          >X</ion-button
                        >
                      </td>
                    </tr>
                  </table>
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

        <ion-button size="large" color="success" slot="end" @click="onFinish">
          Continue
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import ViewPort from "@/components/DataViews/ViewPort.vue";
import HisTable from "@/components/DataViews/HisBasicTable.vue";
import HisKeyboard from "@/components/Keyboard/HisKeyboard.vue";
import { CHARACTERS_AND_NUMBERS_LO } from "@/components/Keyboard/KbLayouts";
import KeyBoardModal from "@/components/Keyboard/HisModalKeyboard.vue";
import handleVirtualInput from "@/components/Keyboard/KbHandler";
import {
  IonToolbar,
  IonHeader,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonRadioGroup,
  IonRadio,
  IonButton,
  modalController,
  IonFooter,
  IonPage,
  IonItem,
  IonLabel,
  IonCheckbox,
} from "@ionic/vue";
import { toastWarning, toastSuccess, alertAction } from "@/utils/Alerts";
import EncounterMixinVue from "./EncounterMixin.vue";
import { BPManagementService } from "../../services/htn_service";
import { UserService } from "@/services/user_service";
import { ProgramService } from "@/services/program_service";
import { Patientservice } from "@/services/patient_service";
import { Program } from "@/interfaces/program";
export default defineComponent({
  mixins: [EncounterMixinVue],
  components: {
    ViewPort,
    // HisTable,
    // IonToolbar,
    // IonHeader,
    // IonContent,
    // IonGrid,
    // IonRow,
    IonButton,
    // IonRadioGroup,
    // IonRadio,
    // IonCol,
    IonFooter,
    IonPage,
    // IonItem,
    // IonLabel,
    // IonCheckbox
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
      input: "",
      HTN: {} as any,
      keyboard: [
        CHARACTERS_AND_NUMBERS_LO,
        [
          ["Done", "Hide"],
          ["Space", "Delete"],
          ["", "Clear"],
        ],
      ] as any,
      drugs: {
        HCZ: {
          drugs: [
            {
              drugName: "HCZ (25mg tablet)",
              drugID: 275,
              current: false,
              selected: false,
              isChecked: false,
              notes: [],
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
              notes: [],
            },
            {
              drugName: "Enalapril (10mg tablet)",
              drugID: 943,
              current: false,
              selected: false,
              isChecked: false,
              notes: [],
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
              notes: [],
            },
            {
              drugName: "Amlodipine (10mg tablet)",
              drugID: 559,
              current: false,
              selected: false,
              isChecked: false,
              notes: [],
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
              notes: [],
            },
            {
              drugName: "Atenolol(100mg tablet)",
              drugID: 11,
              current: false,
              selected: false,
              isChecked: false,
              notes: [],
            },
          ],
          selected: null,
          notes: [],
        },
      } as any,
    };
  },
  methods: {
    removeNote(d: any, i: any, ind: any) {
      this.drugs[d].notes.splice(ind, 1);
    },

    async keypress(text: string) {
      // if (!this.inputFocus) {
      //     return
      // }
      const input = handleVirtualInput(text, this.input);
      if (text.match(/clear/i)) {
        this.input = "";
      } else {
        this.input = input;
      }
    },
    async getCurrentDrugs() {
      const drugs = await this.HTN.getCurrentDrugs();
      drugs.drugs.forEach((drug: any) => {
        for (const key in this.drugs) {
          this.drugs[key].drugs.forEach((element: any, index: any) => {
            if (drug.drug_id === element.drugID) {
              this.drugs[key].drugs[index].current = true;
              this.drugs[key].drugs[index].selected = true;
              this.drugs[key].selected = drug.drug_id;
            }
          });
        }
      });
    },
    selectDrug(key: any, index: any, event: any) {
      console.log(event);
      this.drugs[key].drugs.forEach((d: any, i: any) => {
          this.drugs[key].drugs[i].selected = false;
        // if (i === index) {
        //   this.drugs[key].drugs[index].selected = true;
        //   this.drugs[key].selected = this.drugs[key].drugs[index].drugID;
        // } else {
        //   this.drugs[key].drugs[i].selected = false;
        // }
      });
      this.drugs[key].drugs[index].selected = event.detail.checked;
    },
    async launchKeyPad(d: any) {
      const modal = await modalController.create({
        component: KeyBoardModal,
        backdropDismiss: false,
        cssClass: "large-modal",
      });
      modal.present();
      const { data } = await modal.onDidDismiss();
      this.drugs[d].notes.push({
        date: ProgramService.getSessionDate(),
        description: data,
      });
      return data;
    },
  },
  computed: {
    selectedDrugs(): any {
      let drugs: any[] = [];
      const selectedDrugs = Object.keys(this.drugs).forEach((d: any) => {
        const dr = this.drugs[d].drugs.filter((d: any) => d.selected === true);
        drugs = [...drugs, ...dr];
      });
      return drugs;
    },
  },

  // components: {  },
});
</script>
<style scoped>
.items {
  border: solid 1px black;
}
.mod {
  z-index: 1000;
  background-color: blue;
}
ion-checkbox {
  --size: 30px;
}

#nextButton {
  min-width: 170px !important;
}

.holder {
  width: 99%;
  padding: 1.5%;
}

.blue {
  background-color: #a7cfdf !important;
  border: 1px solid #7eb9d0 !important;
  border-radius: 3px !important;
  color: #ffffff;
  display: inline-block !important;
  font-family: arial, helvetica, sans-serif !important;
  font-size: 28px !important;
  font-weight: bold !important;
  text-decoration: none !important;
  text-shadow: -1px -1px 0 rgba(0, 0, 0, 0.3) !important;
  border-radius: 8px !important;
}

#done {
  border: 1px solid #34740e !important;
  -webkit-border-radius: 3px !important;
  -moz-border-radius: 3px !important;
  border-radius: 5px !important;
  font-size: 28px !important;
  font-family: arial, helvetica, sans-serif !important;
  padding-left: 10px !important;
  margin-left: 20px !important;
  text-decoration: none !important;
  display: inline-block !important;
  text-shadow: -1px -1px 0 rgba(0, 0, 0, 0.3) !important;
  font-weight: bold !important;
  color: #ffffff !important;
  background-color: #4ba614 !important;
  background-image: -webkit-gradient(
    linear,
    left top,
    left bottom,
    from(#4ba614),
    to(#008c00)
  ) !important;
  background-image: -webkit-linear-gradient(top, #4ba614, #008c00) !important;
  background-image: -moz-linear-gradient(top, #4ba614, #008c00) !important;
  background-image: -ms-linear-gradient(top, #4ba614, #008c00) !important;
  background-image: -o-linear-gradient(top, #4ba614, #008c00) !important;
  background-image: linear-gradient(to bottom, #4ba614, #008c00) !important;
  filter: progid:DXImageTransform.Microsoft.gradient(GradientType=0, startColorstr=#4ba614, endColorstr=#008c00) !important;
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

caption {
  font-weight: bold;
  font-size: 26px;
  color: rgba(0, 0, 0, 0.8);
}

.checked {
  background: url("/public/touchscreentoolkit/lib/images/ticked");
}

.unchecked {
  background: url("/public/touchscreentoolkit/lib/images/unticked");
}

.button-success,
.button-secondary {
  color: white;
  border-radius: 4px;
  padding: 3px;
  max-width: 130px;
  margin: auto;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
}

.button-success {
  background: rgb(223, 117, 20);
}

.gray {
  background: lightgray !important;
}

#table-notes td {
  background: rgba(210, 220, 240, 0.5);
  border-radius: 5px;
}

.table-inner-notes {
  width: 100%;
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
}

.note-td {
  padding-left: 20px !important;
  color: rgba(0, 0, 0, 0.8);
  text-shadow: 2px 2px 3px rgba(255, 255, 255, 0.1);
}

.notes-scroll {
  height: 265px !important;
  overflow: auto;
}

#shield {
  position: absolute;
  top: 0%;
  left: 0%;
  width: 100%;
  height: 100%;
  z-index: 150;
  background: rgba(200, 200, 200, 0.5);
  display: none;
}

#keyboard-holder {
  position: absolute;
  top: 20%;
  left: 15%;
  width: 75% !important;
  margin: auto;
  display: none;
  z-index: 900;
}

textarea {
  width: 97% !important;
  border: 1px dotted lightblue;
  border-radius: 5px;
  background: white;
  resize: none;
}

#fixedKeyboard {
  z-index: 999;
}

#done {
  min-width: 100px !important;
}

.today-tr {
  font-style: italic;
  font-weight: bold;
  border-radius: 10px !important;
}
</style>