<template>
  <ion-grid>
    <ion-row>
      <ion-col>
        <p>Complete / incomplete visits: last 5 days</p>
        <apexchart
          width="100%"
          type="bar"
          :options="options"
          :series="series"
        ></apexchart>
      </ion-col>
      <ion-col>
        <p>Encounters created today</p>
        <table>
          <tr>
            <th></th>
            <th>Female</th>
            <th>Male</th>
            <th>Me</th>
            <th>Facility</th>
          </tr>
          <tr v-for="(data, index) in rows" :key="index">
            <td class="encounter-td">{{ encounters[data.encounter] }}</td>
            <td class="other-td">{{ data.female }}</td>
            <td class="other-td">{{ data.male }}</td>
            <td class="other-td">{{ data.me }}</td>
            <td class="other-td">{{ data.facility }}</td>
          </tr>
        </table>
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script lang="ts">
import { IonGrid, IonRow, IonCol } from "@ionic/vue";
import { defineComponent } from "vue";
import ApiClient from "@/services/api_client";
import dayjs from "dayjs";

export default defineComponent({
  data: function () {
    return {
      dayjs,
      startDate: "",
      endDate: "",
      options: {
        chart: {
          id: "vuechart-example",
        },
        xaxis: {
          categories: ["", "", "", "", ""],
        },
      },
      series: [
        {
          name: "complete",
          data: [0, 0, 0, 0, 0],
        },
        {
          name: "incomplete",
          data: [0, 0, 0, 0, 0],
        },
      ],
      rows: [{}],
      encounters: {
        9: "HIV clinic registration",
        51: "HIV reception",
        6: "Vitals",
        52: "HIV staging",
        53: "HIV clinic consultation",
        68: "ART adherence",
        25: "Treatment",
        54: "Dispensing",
        7: "Appointments",
      },
    };
  },
  components: {
    IonGrid,
    IonRow,
    IonCol,
  },
  mounted() {
    this.endDate = this.dayjs().subtract(1, "days").format("YYYY-MM-DD");
    this.startDate = this.dayjs().subtract(5, "days").format("YYYY-MM-DD");
    this.getVisits();
    this.getEncounters();
  },
  methods: {
    getVisits: async function () {
      const response = await ApiClient.get(
        `programs/1/reports/visits?name=visits&start_date=${this.startDate}&end_date=${this.endDate}`
      );
      if (response && response.status == 200) {
        const data = await response.json();
        const days = Object.keys(data);
        const incomplete: number[] = [];
        const complete: number[] = [];
        days.forEach((el, index) => {
          incomplete[index] = data[el].incomplete;
          complete[index] = data[el].complete;
        });
        this.series[0].data = [...complete];
        this.series[1].data = [...incomplete];
        const formattedDays: any[] = days.map((x) => this.dayjs(x).format("dddd"));
        this.options = {
          ...this.options,
          ...{
            xaxis: {
              categories: [...formattedDays],
            },
          },
        };
      }
    },
    getEncounters: async function () {
      const userStats = {
        'encounter_types': [
          ...Object.keys(this.encounters).map((x) => parseInt(x)),
        ],
      };
      const facilityStats = {
        all: true,
        'encounter_types': [
          ...Object.keys(this.encounters).map((x) => parseInt(x)),
        ],
      };
      const response = await ApiClient.post(
        `reports/encounters?date=${this.dayjs().format("YYYY-MM-DD")}`,
        userStats
      );
      const response2 = await ApiClient.post(
        `reports/encounters?date=${this.dayjs().format("YYYY-MM-DD")}`,
        facilityStats
      );
      if (
        response &&
        response2 &&
        response.status == 200 &&
        response2.status == 200
      ) {
        const data = await response.json();
        const allData = await response2.json();
        const rows: any = [];
        Object.keys(data).forEach((element) => {
          rows.push({
            encounter: element,
            female: allData[element]["F"],
            male: allData[element]["M"],
            me: data[element]["F"] + data[element]["M"],
            facility: allData[element]["F"] + allData[element]["M"],
          });
        });
        this.rows = [...rows];
      }
    },
  },
});
</script>

<style scoped>
ion-grid {
  color: #333333;
}
.encounter-td {
  text-align: left
}
.other-td {
  text-align: right;
  min-width: 60px;
}
table {
  font-family: arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

td,
th {
  border: 1px solid #dddddd;
  text-align: right;
  padding: 8px;
}

tr:nth-child(even) {
  background-color: #dddddd;
}
</style>