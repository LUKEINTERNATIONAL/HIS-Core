<template>
  <div>
    <view-port :showFull="true">
      <ion-grid class="view-port-content">
        <ion-row >
          <ion-col :size="getSize" v-for="(item, index) in listData" :key="index">
            <ion-grid>
            <ion-row>
            <ion-col size="6">
            <h1>{{ item.label }}</h1>
          </ion-col>
          <ion-col size="6">
            <ion-segment
              mode="ios"
              v-model="item.value"
              @ionChange="() => onChange(item)"
            >
              <ion-segment-button
                class="yes-no"
                v-for="(option, idx) in item.other.values"
                :key="idx"
                :value="option.value"
              >
                <ion-label>{{ option.label }}</ion-label>
              </ion-segment-button>
            </ion-segment>
          </ion-col>

            </ion-row>
            </ion-grid>
          </ion-col>
        </ion-row>
      </ion-grid>
    </view-port>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import SelectMixin from "@/components/FormElements/SelectMixin.vue";
import {
  IonRow,
  IonGrid,
  IonLabel,
  IonCol,
  IonSegment,
  IonSegmentButton,
} from "@ionic/vue";
import { Option } from "../Forms/FieldInterface";
export default defineComponent({
  components: {
    IonRow,
    IonGrid,
    IonLabel,
    IonCol,
    IonSegmentButton,
    IonSegment,
  },
  name: "HisMultiYesNo",
  mixins: [SelectMixin],
  watch: {
    clear() {
      this.listData = this.listData.map(i => {
        i.value = ''
        return i
      })
    }
  },
  computed: {
    getSize(): string {
      return this.listData.length > 6 ? '6' : '12'
    }
  },
  async activated() {
    this.$emit('onFieldActivated', this)
    const values = this.listData.filter(i => i.value != '')
    this.listData = await this.options(this.fdata, values);
  },
  methods: {
    onChange(val: Option): void {
      this.$nextTick(async () => {
        const values = this.listData.map(i => i.value!='')
        if (typeof this.onValue === 'function') {
          const ok = await this.onValue(val, this.fdata, this.cdata)
          if (!ok) {
            val.value = ""
            return
          }
        }
        if(typeof this.onValueUpdate === 'function') {
          this.listData = await this.onValueUpdate(this.listData, val)
        }
        if (values.every(Boolean)) {
          this.$emit("onValue", this.listData)
        }
      })
    }
  }
})
</script>
<style scoped>
ion-segment-button {
  height: 50px;
  margin: 1%;
  font-size: 1.6em;
  --indicator-color: #028000;
  --background: white;
}

.segment-button-checked {
  color: white;
}
</style>