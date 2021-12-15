<template>
  <view-port>
    <div class="view-port-content">
      <ion-grid>
        <ion-row class="mobile-component-view" :style="{width: '100%', 'background-color': BMI.color, color: 'white', padding:'10px', textAlign: 'center'}"> 
          {{BMI.result}}
        </ion-row>
        <p/>
        <ion-row>
          <ion-col size="2">
            <option-button
              v-for="(key, bIndex) in keys"
              :key="bIndex"
              :label="key.label"
              :isActive="activeField === bIndex"
              :image="'vitals/'+key.other.icon"
              @click="setActiveField(bIndex)"
              v-show="key.other.visible !== false"
            >
            </option-button>
          </ion-col>
          <ion-col size-lg="6" size-sm="10">
            <div class="centered his-card">
              <ion-input
                type="text"
                class='keypad-input'
                v-if="keys.length > 0"
                :value="keys[activeField].value"
                :readonly="!(isPlatform('desktop'))"
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
          <ion-col class="full-component-view" size="4">
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
              <ion-item> 
                  <ion-label :style="{'background-color': BMI.color, color: 'white', padding:'10px', 'text-align': 'center'}"> 
                    {{BMI.result}}
                  </ion-label>
              </ion-item>
            </ion-list>
          </ion-col>
        </ion-row>
      </ion-grid>
    </div>
  </view-port>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import ViewPort from "../DataViews/ViewPort.vue";
import {
  IonGrid,
  IonCol,
  IonRow,
  isPlatform
} from "@ionic/vue";
import { VITALS_KEYPAD } from "../Keyboard/KbLayouts";
import { BMIService } from "@/services/bmi_service";
import OptionButton from "@/components/Buttons/ActionSideButton.vue"
import FieldMixinVue from "./FieldMixin.vue";
import { VitalsService } from "@/apps/ART/services/vitals_service";
import { toastWarning } from "@/utils/Alerts";
import { Option } from "../Forms/FieldInterface";

export default defineComponent({
  components: {
    ViewPort,
    IonGrid,
    IonCol,
    IonRow,
    OptionButton
  },
  mixins: [FieldMixinVue],
  data: () => ({
    keys: [] as Option[],
    patientID: "" as any,
    activeField: 0,
    vitalService: {} as any,
    age: null as any,
    gender: null as any,
    keyboard: VITALS_KEYPAD,
    BMI: {
      index: 0,
      result: "Normal",
      color: "",
    },
    isPlatform,
  }),
  activated(){
    this.$emit('onFieldActivated', this)
  },
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
      return weight[0].value === "" ? 0 : parseFloat(`${weight[0].value}`);
    },
    getHeight(): number {
      const height = this.keys.filter((key: any) => key.label === "Height");
      return height[0].value === "" ? 0 : parseFloat(`${height[0].value}`);
    },
    getAge(): number {
      const age = this.keys.filter((key: any) => key.label === "Age");
      return age[0].value === "" ? 0 : parseFloat(`${age[0].value}`);
    },
    async init() {
      this.keys = await this.options(this.fdata);
      this.vitalService = new VitalsService(this.config.patientId, this.config.providerID)
    },
    async setActiveField(index: number) {
      const vital = this.keys[this.activeField]
      if(!vital.value && !vital.other.required) {
        this.activeField = index
      } else {
        const errs = this.vitalService.validator(vital)
        if(errs && errs.length) toastWarning(errs)
        else this.activeField = index
      }
    }
  },
  mounted() {
    this.init();
    if (this.preset) {
      this.gender = this.preset.value;
    }
  },
});
</script>
<style scoped>
.full-component-view {
  display: block;
}
.mobile-component-view {
  display: none;
}

@media (max-width:990px) {
  .full-component-view {
      display: none;
  }
  .mobile-component-view {
      display: block;
  }
}
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
</style>