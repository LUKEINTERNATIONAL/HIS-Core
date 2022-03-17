<template>
  <view-port>
    <div class="view-port-content">
      <ion-grid style="width: 100%">
        <ion-row>
          <ion-col size="2">
            <option-button
              v-for="(key, bIndex) in keys"
              :key="bIndex"
              :label="key.label"
              :isActive="activeField === bIndex"
              :image="'vitals/'+key.other.icon"
              @click="activeField = bIndex"
              v-show="key.other.visible !== false"
            >
            </option-button>
          </ion-col>
          <ion-col size="6">
            <div class="centered">
              <ion-input
                type="text"
                class='keypad-input'
                v-if="keys.length > 0"
                :value="keys[activeField].value"
              />
              <table class="keypad">
                <tr v-for="(row, rowIndex) in keyboard" :key="rowIndex">
                  <td class='his-keyboard-margin' v-for="(btnKey, btnIndex) in row" :key="`btn-${btnIndex}`">
                    <ion-button color="primary" class="his-keyboard-btn" @click="onKeyPress(btnKey)">
                      {{ btnKey }}
                    </ion-button>
                  </td>
                </tr>
              </table>
            </div>
          </ion-col>
          <ion-col size="4">
            <ion-list> 
              <ion-item
                v-for="(key, rIndex) in keys" 
                :key="rIndex"
                :color="activeField === rIndex ? 'secondary': ''">
                <ion-label><b>{{ key.label }}</b></ion-label>
                <ion-label slot="end">
                  <span class='value-highlight'>
                    {{ key.value || '-' }}
                  </span> 
                  {{ key.other.modifier }} 
                </ion-label>
              </ion-item>
              <ion-item> 
                <ion-label>
                  <b>BMI</b>
                </ion-label>
                <ion-label slot="end"> 
                  <span class='value-highlight'>
                    {{ BMI.index }}
                  </span>
                </ion-label>
              </ion-item>
              <!-- <ion-item> 
                  <ion-label :style="{'background-color': BMI.color, color: 'white', padding:'10px', 'text-align': 'center'}"> 
                    {{BMI.result}}
                  </ion-label>
              </ion-item> -->
            </ion-list>
          </ion-col>
        </ion-row>
      </ion-grid>
    </div>
  </view-port>
</template>
<script lang="ts">
import { defineComponent, PropType } from "vue";
import ViewPort from "../DataViews/ViewPort.vue";
import {
  IonGrid,
  IonCol,
  IonRow
} from "@ionic/vue";
import { VITALS_KEYPAD } from "../Keyboard/KbLayouts";
import { BMIService } from "@/services/bmi_service";
import { Option } from "../Forms/FieldInterface";
import OptionButton from "@/components/Buttons/ActionSideButton.vue"
import HisDate from "@/utils/Date"
import { EncounterService } from "@/services/encounter_service";
import { Encounter } from "@/interfaces/encounter";
export default defineComponent({
  components: {
    ViewPort,
    IonGrid,
    IonCol,
    IonRow,
    OptionButton
  },
  props: {
    fdata: {
      type: Object as PropType<Record<string, any>>,
      required: true,
    },
    options: {
      type: Function,
      required: true,
    },
    clear: {
      type: Boolean,
    },
    preset: {
      type: Object as PropType<Option>,
      required: false,
    },
  },
  data: () => ({
    keys: [] as any,
    patientID: "" as any,
    activeField: 0,
    age: null as any,
    gender: null as any,
    keyboard: VITALS_KEYPAD,
    BMI: {
      index: 0,
      result: "Normal",
      color: "",
    },
    currentDate: '',
    encounters: [] as Array<Encounter>,
    encounterID: '' as any,

  
  }),
  watch: {
    keys: {
      async handler(params) {
        this.$emit("onValue", params);
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    img(name: string) {
      return `assets/images/vitals/${name}.png`;
    },
    async getBMI(): Promise<any> {
      const BMI: any = await BMIService.getBMI(
        this.getWeight(),
        this.getHeight(),
        this.gender,
        this.getAge()
      );
      this.BMI.index = BMI.index;
      this.BMI.result = BMI.result;
      this.BMI.color = BMI.color;
    },
     async getEncounter()
    {
        this.currentDate = HisDate.currentDisplayDate();
  const currentDate = new Date(this.currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
  const date = new Date(currentDate).toISOString().slice(0, 10);
  // const patientID: any = this.$route.params.patientID;
  const patientID: any = this.$route.params.patient_id;

  await EncounterService.getEncounters(patientID, {date}).then((data) => {
 this.encounters = data;
  
  for(const totalEncounters in this.encounters)
  {
  if(this.encounters[totalEncounters].observations.length > 0 && this.encounters[totalEncounters].encounter_type ==6)
  {
    this.encounterID = this.encounters[totalEncounters].encounter_id;
    for(const x in this.encounters[totalEncounters].observations)
    {
      const conceptID = this.encounters[totalEncounters].observations[x].concept_id;
      const valueNumeric: any = this.encounters[totalEncounters].observations[x].value_numeric;
      if(conceptID == 2137)
      {
        this.BMI.index = valueNumeric;
      }
     
    
    }
  }
  }
  });
    },
    async onKeyPress(key: any) {
      const currentValue = this.keys[this.activeField].value;
      if (key.match(/del/i)) {
        this.keys[this.activeField].value = currentValue.substring(
          0,
          currentValue.length - 1
        );
      } else if (key.match(/clear/i)) {
        this.keys[this.activeField].value = "";
      } else {
        this.keys[this.activeField].value += key;
      }
      this.getBMI();
    },
    getWeight(): number {
      const weight = this.keys.filter((key: any) => key.label === "Weight");
      return weight[0].value === "" ? 0 : parseFloat(weight[0].value);
    },
    getHeight(): number {
      const height = this.keys.filter((key: any) => key.label === "Height");
      return height[0].value === "" ? 0 : parseFloat(height[0].value);
    },
    getAge(): number {
      const age = this.keys.filter((key: any) => key.label === "Age");
      return age[0].value === "" ? 0 : parseFloat(age[0].value);
    },
    async init() {
      this.keys = await this.options(this.fdata);
    },
  },
  mounted() {
    this.init();
    if (this.preset) {
      this.gender = this.preset.value;
    }
     this.getEncounter();
     
  },
});
</script>
<style scoped>
.view-port-content {
  height: 100%;
  background: white;
} 
.value-highlight {
  color: green;
  font-weight: bold;
}
ion-col {
  border-right: #ccc solid 1px;
}
.keypad {
  margin: auto;
}
.centered {
  width: 90%;
  background: #f4f4f4;
  padding: 1.2em;
  margin: auto;
}
.his-keyboard-btn {
  width: 110px;
  font-size: 1.4em;
  height: 70px;
}
.keypad-input {
  border: solid 1px #ccc;
  background: white;
  border-radius: 10px;
  width: 92%;
  height: 100px;
  margin: auto;
  text-align: center;
  font-size: 3em;
  margin: 15px;
}
@media (max-width: 800px) {
   
   .keypad-input {

  width: 90%;
 
}
.centered {
  width: 95%;

}
}
</style>