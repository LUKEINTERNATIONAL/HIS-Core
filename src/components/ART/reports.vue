<template>
  <div>
    <div v-show="activeReports.length <= 0">
      <ion-grid>
        <ion-row v-for="(row, rowIndex) in reports" :key="rowIndex">
          <ion-col size="4" v-for="(group, index) in row" :key="index">
            <task-card
              @click="activeReports = group.files"
              :key="index"
              :title="group.name"
              :icon="group.icon"
            >
            </task-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </div>
    <div v-if="activeReports.length >= 1">
      <ion-button @click="activeReports = []" color="danger">back</ion-button>
      <br />
      <ion-grid>
        <ion-row>
          <ion-col
            size="6"
            v-for="(innerreport, idx) in activeReports"
            :key="idx"
          >
            <task-card
              @click="gotoReport(innerreport)"
              :key="index"
              :title="innerreport.name"
              :icon="innerreport.icon"
            >
            </task-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from "vue";
import { IonButton } from "@ionic/vue";
import ART from "@/apps/ART/app"
import { ReportInterface, ReportGroupInterface } from "@/apps/interfaces/AppInterface"
import TaskCard from "@/components/DataViews/TaskCard.vue";
import Transformer from "@/utils/Transformers"

export default defineComponent({
  components: {
    IonButton,
    "task-card": TaskCard,
  },
  data: () => ({
    reportGroups: ART.reports as Array<ReportGroupInterface>,
    activeReports: [] as Array<ReportInterface>
  }),
  computed: {
    reports(): any {
      return Transformer.convertArrayToTurples(ART.reports, 3)
    }
  },
  methods: {
    gotoReport(reportFile: ReportInterface){
      if (reportFile.pathName) {
        return this.$router.push({name: reportFile.pathName})
      }
      if (reportFile.pathUrl) {
        this.$router.push(reportFile.pathUrl)
      }
    }
  }
})
</script>