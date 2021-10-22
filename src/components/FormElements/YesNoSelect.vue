<template>
  <div>
    <view-port :showFull="false">
      <ion-grid>
        <ion-row button v-for="(item, index) in filtered" :key="index">
          <ion-col size="6">
            <h1>{{ item.label }}</h1>
          </ion-col>
          <ion-col size="6">
            <ion-segment
              mode="ios"
              @ionChange="segmentChanged($event)"
              v-model="value"
            >
              <ion-segment-button
                class="yes-no"
                v-for="(option, idx) in item.values"
                :key="idx"
                :value="option.value"
              >
                <ion-label>{{ option.label }}</ion-label>
              </ion-segment-button>
            </ion-segment>
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
export default defineComponent({
  components: {
    IonRow,
    IonGrid,
    IonLabel,
    IonCol,
    IonSegmentButton,
    IonSegment,
  },
  name: "HisSelect",
  mixins: [SelectMixin],
  watch: {
    clear(val: boolean) {
      if (val) this.clearSelection();
    },
    value(value: any) {
      this.$emit('onValue', { label: this.filtered[0].label, value: value })
    }
  },
  data() {
    return {
      value: null as any,
    };
  },
  async activated() {
    this.$emit('onFieldActivated', this)
    this.listData = await this.options(this.fdata);
  },
  async mounted() {
    this.listData = await this.options(this.fdata);
    if(this.preset) {
      this.value = this.preset;
    }
  },
  methods: {
    onselect(data: any): void {
      this.$emit("onValue", data);
    },
    segmentChanged(ev: CustomEvent) {
      this.onselect(ev.detail.value);
    },
  }
});
</script>
<style scoped>
ion-segment-button {
  height: 50px;
  margin: 1%;
  font-size: 1.6em;
  --indicator-color: #028000;
  --border-color: red;
  --background: white;
}

.segment-button-checked {
  color: white;
}
</style>