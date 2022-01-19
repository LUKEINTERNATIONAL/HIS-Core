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
        <div class="view-port-content" v-if="drugs">
          <table id="main-table" style="width:100%;">
            <tr>
              <th>&nbsp;</th>
              <th v-for="(item, itemIndex) in drugs" :key="itemIndex"> 
                {{ itemIndex }}
                <ion-row> 
                  <ion-col class="col-borders" v-for="(drug, drugIndex) in item.drugs" :key="drugIndex"> 
                    {{drug.amount || '0mg'}}
                  </ion-col>
                </ion-row>
              </th>
            </tr>

            <tr>
              <td class="td-remaining td-title">
                <span>New/Current</span>
              </td>
              <td v-for="(item, itemIndex) in drugs" :key="itemIndex"  class="td-current td-value">
                <ion-row> 
                  <ion-col v-for="(drug, i) in item.drugs" :key="i">
                    <ion-checkbox
                      :checked="drug.selected"
                      @ionChange="selectDrug(itemIndex, i, $event)"
                    ></ion-checkbox>
                  </ion-col>
                </ion-row>
              </td>
            </tr>

            <tr>
              <td class="td-remaining td-title">
                <span>&nbsp;</span>
              </td>
              <td
                class="td-remaining td-value"
                v-for="(drug, ind) in Object.keys(drugs)"
                :key="ind">
                <ion-row>
                  <ion-col>
                    <ion-button 
                      @click="launchNotePad(drug)"
                      color="warning">
                        Add notes
                    </ion-button>
                  </ion-col>
                </ion-row>
              </td>
            </tr>
          </table>
          <p/>
          <table id="table-notes" style="width:100%">
            <caption style="font-size: 1.2em">
              Notes
            </caption>
            <p/>
            <tr>
              <th style="width: 25%" v-for="(d, drugIndex) in drugs" :key="drugIndex">
                <span>{{ drugIndex }}</span>
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
        </div>
      </view-port>
    </ion-content>
    <ion-footer>
      <ion-toolbar color="dark">
        <ion-button
          size="large"
          color="danger"
          slot="start"
          @click="gotoPatientDashboard"
        >
          cancel
        </ion-button>

        <ion-button 
          v-if="selectedDrugs && selectedDrugs.length > 0" 
          size="large" 
          color="success" 
          slot="end" 
          @click="onFinish">
          Continue
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ViewPort from "@/components/DataViews/ViewPort.vue";
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Field } from '@/components/Forms/FieldInterface'
import TouchField from "@/components/Forms/SIngleTouchField.vue"

import {
  IonToolbar,
  IonHeader,
  IonContent,
  IonRow,
  IonCol,
  IonButton,
  modalController,
  IonFooter,
  IonPage,
  IonCheckbox,
} from "@ionic/vue";
import EncounterMixinVue from "./EncounterMixin.vue";
import { BPManagementService } from "../../services/htn_service";
import { ProgramService } from "@/services/program_service";
import { toastWarning } from "@/utils/Alerts";
import { isEmpty } from "lodash"

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: {
    ViewPort,
    IonToolbar,
    IonHeader,
    IonContent,
    IonRow,
    IonButton,
    IonCol,
    IonFooter,
    IonPage,
    IonCheckbox
  },
  watch: {
    patient: {
      async handler() {
        this.HTN = new BPManagementService(this.patientID, this.providerID);
        this.drugs = this.HTN.getDrugs();
        await this.getCurrentDrugs();
      },
      deep: true,
    },
  },
  data: () => {
    return {
      input: "",
      HTN: {} as any,
      drugs: null as any,
    };
  },
  methods: {
    removeNote(d: any, i: any, ind: any) {
      this.drugs[d].notes.splice(ind, 1);
    },
    launchNotePad(drugIndex: any) {
      this.showModal({
        id: 'note',
        helpText: `Add notes for ${drugIndex}`,
        type: FieldType.TT_TEXT
      }, 
      (data: any) => {
        if (data) this.drugs[drugIndex].notes.push({
          date: ProgramService.getSessionDate(),
          description: data.value || '',
          drugID: this.drugs[drugIndex].drugs[0].drugID,
          isNewNote: true
        })
      })
    },
    async onFinish() {
      const drugNotes = Object.values(this.drugs)
        .filter((d: any) => !isEmpty(d.notes))
        .map((d: any) => d.notes)
        .reduce((accum: any, cur: any) => accum.concat(cur), [])
        .filter((n: any) => n.isNewNote)
        .map((note: any) => this.HTN.buildObs('Clinician notes', {
          'value_text': note.description, 
          'value_drug': note.drugID
        }))
      if (!isEmpty(drugNotes)) {
        try {
          await this.HTN.createEncounter()
          await this.HTN.saveObservationList(await (Promise.all(drugNotes)))
        } catch (e) {
          return toastWarning(`Unable to save notes ${e}`)
        }
      }
      this.gotoTreatment()
    },
    gotoTreatment() {
      const htnDrugs = this.selectedDrugs.map((d: any) => d.drugID).join(',')
      this.$router.push(`/art/encounters/prescriptions/${this.patientID}?htn_drugs=${htnDrugs}`)
    },
    async showModal(currentField: Field, onFinish: Function) {
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
    async getCurrentDrugs() {
      const { drugs, notes} = await this.HTN.getCurrentDrugs();
      // build notes
      for (const drugIndex in notes) {
        this.drugs[drugIndex].notes = Object.keys(notes[drugIndex])
          .map((date: string) => notes[drugIndex][date].map(
            (description: string) => ({ date, description }))
          ).reduce(
            (accum: any[], cur: any[]) => accum.concat(cur), []
          )
      }
      // activate drug selection
      drugs.forEach((drug: any) => {
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
      this.drugs[key].drugs.forEach((d: any, i: any) => {
        this.drugs[key].drugs[i].selected = false;
      });
      this.drugs[key].drugs[index].selected = event.detail.checked;
    }
  },
  computed: {
    selectedDrugs(): any {
      let drugs: any[] = [];
      if (!isEmpty(this.drugs)) {
        Object.keys(this.drugs).forEach((d: any) => {
          const drug = this.drugs[d]
          const dr = drug.drugs.filter((d: any) => d.selected === true)
            .map((d: any) => ({ ...d, notes: drug.notes }));
          drugs = [...drugs, ...dr];
        })
      }
      return drugs;
    },
  },
});
</script>
<style scoped>
ion-checkbox {
  --size: 30px;
}
.col-borders {
  border: 1px dotted lightgray;
  border-radius: 3px;
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



.today-tr {
  font-style: italic;
  font-weight: bold;
  border-radius: 10px !important;
}
</style>