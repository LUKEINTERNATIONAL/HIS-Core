<template>
  <view-port>
    <div class="view-port-content">
      <ion-grid>
        <ion-row>
          <ion-col size="9">
            <Calendar
              color="blue"
              ref="calendar"
              is-expanded
              class="custom-calendar max-w-full"
              :min-date="sessionDate"
              :max-date="runOutDate"
              :attributes="attributes"
            >
              <template v-slot:day-content="{ day }">
                <div
                  v-bind:class="{
                    selected: day.id === cDate,
                    isDisabled: day.isDisabled,
                  }"
                >
                  <span
                    @click="dayClicked(day)"
                    >{{ day.day }}</span
                  >
                  <sup v-if="day.id === cDate" class="appointments">{{
                    appointments.length
                  }}</sup>
                </div>
              </template>
            </Calendar>
          </ion-col>
          <ion-col size="3">
            <table>
              <tr>
                <td>
                  <tr>
                    <td><b>Medication Run out Date</b></td>
                  </tr>
                  <tr>
                    <td>{{ rDate }}</td>
                  </tr>
                </td>
              </tr>
              <tr>
                <td>
                  <tr>
                    <td>
                      <b>

                        User set appointment date
                      </b>
</td>
                  </tr>
                  <tr>
                    <td>{{ aDate }}</td>
                  </tr>
                </td>
              </tr>
              <tr>
                <td>
                  <tr>
                    <td><b>Appointment(s)</b></td>
                  </tr>
                  <tr>
                    <td>{{ appointments.length }}</td>
                  </tr>
                </td>
              </tr>
              <tr>
                <td>
                  <tr>
                    <td><b>Appointment limit (per/day)</b></td>
                  </tr>
                  <tr>
                    <td>{{ appointmentLimit }}</td>
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
import { Calendar } from "v-calendar";
import HisDate from "@/utils/Date";
import { AppointmentService } from "@/apps/ART/services/appointment_service";
import FieldMixinVue from "./FieldMixin.vue";
import ART_GLOBAL_PROP from "@/apps/ART/art_global_props"

export default defineComponent({
  components: { ViewPort, Calendar, IonGrid, IonCol, IonRow },
  mixins: [FieldMixinVue],
  watch: {
    startDate: {
      async handler(params: any) {
        
        if (params) {
          this.getAppointments();
          this.emitVal(params);
        }else {
          this.emitVal(HisDate.toStandardHisDisplayFormat(this.sessionDate));
        }
      },
      immediate: true,
    },
  },
  data: () => ({
    rows: [],
    startDate: null as any,
    runOutDate: null as any,
    appointments: [],
    appointmentLimit: 0 as any,
    sessionDate: null as any
  }),
  activated(){
    this.$emit('onFieldActivated', this)
  },
  async created() {
    const items = await this.options(this.fdata);
    this.sessionDate = AppointmentService.getSessionDate();
    const date = items[0].other.appointmentDate;
    this.setDate(date);
    this.getAppointmentLimit();
    this.runOutDate = new Date(items[0].other.runOutDate);
  },
  methods: {
    async getAppointments() {
      this.appointments = await AppointmentService.getDailiyAppointments(
        HisDate.toStandardHisFormat(this.aDate)
      );
    },
    async getAppointmentLimit() {
      const limit = await ART_GLOBAL_PROP.appointmentLimit();
      if (limit) {
        this.appointmentLimit = limit;
      }
    },
    async setDate(date: any) {
      this.startDate = new Date(date);
      const calendar: any = this.$refs.calendar;
      await calendar.move(this.startDate);
      await calendar.focusDate(this.startDate);
    },
    dayClicked(day: any) {
      !day.isDisabled && this.setDate(day.id);
    },
    emitVal(date: any) {
      this.$emit("onValue", { label: "", value: date });
    }
  },
  computed: {
    aDate(): string {
      return HisDate.toStandardHisDisplayFormat(this.startDate);
    },
    rDate(): string {
      return HisDate.toStandardHisDisplayFormat(this.runOutDate);
    },
    cDate(): string {
      return HisDate.toStandardHisFormat(this.startDate);
    },
    attributes() {
      return [
        {
          highlight: true,
          dates: this.aDate
        }
      ]
    }
  },
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