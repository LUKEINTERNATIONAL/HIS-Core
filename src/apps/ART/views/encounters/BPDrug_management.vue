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
            <div>
              <ion-grid>
                <ion-row>
                  <ion-col size="0.5"></ion-col>
                  <ion-col  v-for="(drug, index) in Object.keys(drugs)" :key="index" :size="drugs[drug].length > 1 ? 3 : 2" class="items">
                    <ion-item>

                      <p >{{ drug }}</p> 
                    </ion-item>
                    <ion-row >

                      <ion-col v-for="(d, i) in drugs[drug]" :key="i" :size="drugs[drug].length > 1 ? 6 : 12">
                     <ion-row>
                      <ion-col size="12"><p>{{d.drugName}}</p></ion-col>
                      <ion-col size="12"><ion-checkbox v-model="d.current"></ion-checkbox> </ion-col>
                      <ion-col size="12"><ion-checkbox v-model="d.isChecked"></ion-checkbox> </ion-col>
                      <ion-col size="12"><ion-button size="small" @click="launchKeyPad(drug, i)">Add notes</ion-button> </ion-col>
                      <ion-col size="12">
                        <ion-item v-for="(note, ind) in d.notes" :key="note">
                            <p>{{note}}</p>
                            <ion-button @click="removeNote(drug, i, ind)" color="danger">
                              X
                            </ion-button>
                          
                        </ion-item>
                      </ion-col>
                       </ion-row> 
                      </ion-col> 
                    </ion-row>
                  </ion-col>
                </ion-row>
                <ion-row>
                  <his-table :columns="columns" :rows="rows"></his-table>
                </ion-row>
                <ion-row style="margin-top: 40vh">
                  <ion-radio-group v-model="action">
                    <ion-grid>
                      <ion-row>
                        <ion-col
                          size="4"
                          v-for="(item, index) in items"
                          :key="index"
                        >
                          <ion-item>
                            <ion-label>{{ item.label }}</ion-label>
                            <ion-radio :value="item"></ion-radio>
                          </ion-item>
                        </ion-col>
                      </ion-row>
                    </ion-grid>
                  </ion-radio-group>
                </ion-row>
              </ion-grid>
            </div>
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
          Finish
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import ViewPort from "@/components/DataViews/ViewPort.vue";
import HisTable from "@/components/DataViews/HisBasicTable.vue";
import HisKeyboard from "@/components/Keyboard/HisKeyboard.vue"
import { CHARACTERS_AND_NUMBERS_LO } from "@/components/Keyboard/KbLayouts";
import KeyBoardModal from "@/components/Keyboard/HisModalKeyboard.vue"
import handleVirtualInput from "@/components/Keyboard/KbHandler"
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
  IonCheckbox
} from "@ionic/vue";
import { toastWarning, toastSuccess, alertAction } from "@/utils/Alerts";
import EncounterMixinVue from "./EncounterMixin.vue";
import RiskFactorModal from "@/components/DataViews/RiskFactorModal.vue";
import { ObservationService } from "@/services/observation_service";
import { ConceptService } from "@/services/concept_service";
import { Service } from "@/services/service";
import HisDate from "@/utils/Date";
import { isEmpty } from "lodash";
import { BPManagementService } from "../../services/htn_service";
import { UserService } from "@/services/user_service";
import { ProgramService } from "@/services/program_service";
import { Patientservice } from "@/services/patient_service";
import { Program } from "@/interfaces/program";
export default defineComponent({
  mixins: [EncounterMixinVue],
  components: {
    ViewPort,
    HisTable,
    IonToolbar,
    IonHeader,
    IonContent,
    IonGrid,
    IonRow,
    IonButton,
    IonRadioGroup,
    IonRadio,
    IonCol,
    IonFooter,
    IonPage,
    IonItem,
    IonLabel,
    IonCheckbox
  },
  data: () => {
    return {
      input: '',
keyboard: [
            CHARACTERS_AND_NUMBERS_LO, 
            [
                ['Done','Hide'],
                ['Space', 'Delete'],
                ['', 'Clear']
            ]
        ] as any,
      drugs: {
        'HCZ': [
          {
            drugName: "HCZ (25mg tablet)",
            drugID: 275,
            current: false,
            selected: false,
            isChecked: false,
            notes: []
          },
        ],
        'Enalapril': [
          {
            drugName: "Enalapril (5mg tablet)",
            drugID: 942,
            current: false,
            selected: false,
            isChecked: false,
            notes: []
          },
          {
            drugName: "Enalapril (10mg tablet)",
            drugID: 943,
            current: false,
            selected: false,
            isChecked: false,
            notes: []
          },
        ],
        'Amlodipine': [
          {
            drugName: "Amlodipine (5mg tablet)",
            drugID: 558,
            current: false,
            selected: false,
            isChecked: false,
            notes: []
          },
          {
            drugName: "Amlodipine (5mg tablet)",
            drugID: 559,
            current: false,
            selected: false,
            isChecked: false,
            notes: []
          },
        ],
        'Atenolol': [
          {
            drugName: "Atenolol (50mg tablet)",
            drugID: 117,
            current: false,
            selected: false,
            isChecked: false,
            notes: []
          },
          {
            drugName: "Atenolol(100mg tablet)",
            drugID: 11,
            current: false,
            selected: false,
            isChecked: false,
            notes: []
          },
        ],
      } as any,
    };
  },
  methods: {
    removeNote(d: any, i: any, ind: any) {
      this.drugs[d][i].notes.splice(ind, 1);
    },
    
async keypress(text: string) {
            // if (!this.inputFocus) {
            //     return
            // }
            const input = handleVirtualInput(text, this.input)
            if (text.match(/clear/i)) {
                this.input = '';
            } else {
                this.input = input
            }
        },
  async launchKeyPad(d: any,i: any) {
        const modal = await modalController.create({
            component: KeyBoardModal,
            backdropDismiss: false,
            cssClass: 'large-modal',
            
        })
        modal.present()
        const { data } = await modal.onDidDismiss()
        this.drugs[d][i].notes.push(data)
        console.log(this.selectedDrugs);
        return data
    }
},
computed: {
  selectedDrugs(): any {
    let drugs: any[] = [];
    const selectedDrugs = Object.keys(this.drugs).forEach((d: any) => {
      const dr =  this.drugs[d].filter((d: any) => d.isChecked === true)
      console.log(dr)
      drugs = [...drugs, ...dr];
    });
    return drugs;
  }
}

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
</style>