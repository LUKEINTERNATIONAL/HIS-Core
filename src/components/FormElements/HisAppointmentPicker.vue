<template>
  <view-port>
    <div class="view-port-content">
      <ion-grid>
        <ion-row>
          <ion-col size="9">
            <DatePicker 
              is-expanded  
              v-model="date"
              :max-date="maxDate"
              class="custom-calendar max-w-full"
            />
          </ion-col>
          <ion-col size="3">
            <table>
              <tr>
                <td>
                  <tr>
                    <td><b>Appointment(s)</b></td>
                  </tr>
                  <tr>
                    <td> {{ appointmentCounter }} </td>
                  </tr>
                </td>
              </tr>
            </table>
          </ion-col>
        </ion-row>
      </ion-grid>
    </div>
  </view-port>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ViewPort from "@/components/DataViews/ViewPort.vue";
import { IonGrid, IonCol, IonRow } from "@ionic/vue";
import { DatePicker } from "v-calendar";
import { Service } from "@/services/service";
import HisDate from "@/utils/Date"
import FieldMixinVue from "./FieldMixin.vue";

export default defineComponent({
  components: { DatePicker, ViewPort, IonGrid, IonCol, IonRow },
  mixins: [FieldMixinVue],
  watch: {
    date: {
      async handler(date: string) {
        if (date) {
          const formated = HisDate.toStandardHisFormat(date)
          if (this.onValue) {
            const ok = await this.onValue(formated, this)
            if (!ok) return
          }
          this.$emit('onValue', formated)
        }
      },
      immediate: true
    }
  },
  data: () => ({
    date: '',
    minDate: '',
    appointmentCounter: 0
  }),
  created() {
    this.minDate = Service.getSessionDate()
  },
  activated(){
    this.$emit('onFieldActivated', this)
  }
});
</script>
<style>
.vc-day {
  position: relative;
  min-height: 32px;
  z-index: 1;
  text-align: center;
  font-size: 3vh;
  height: 80px;
}
.vc-highlight {
  width: 100%;
  height: 100%;
  border-radius: 0%;
}
.selected {
  font-size: 4vh;
  height: 100%;
  margin-top: 15%;
  color: white;
}
.isDisabled {
  color: #00000040;
}
</style>
<style scoped>
.view-port-content {
  background-color: white;
}
table {
  font-family: arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
}
td,
th {
  text-align: left;
  padding: 8px;
}
.appointments {
  font-size: 3vh;
  color: rgb(0, 255, 115);
}
.custom-calendar .vc-day {
  height: 50px;
  text-align: center;
}
</style>