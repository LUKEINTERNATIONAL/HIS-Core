<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>{{title}}</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-grid class="selector">
    <ion-row>
      <ion-col 
        size="4" 
        v-for="(taskItem, index) in filteredItems" 
        :key="index">
        <task-card
          @click="doTask(taskItem)"
          :title="taskItem.name.toUpperCase()"
          :description="taskItem.description"
          :icon="img(taskItem.icon)">
        </task-card>
     </ion-col>
    </ion-row>
  </ion-grid>
  <ion-footer>
    <ion-toolbar> 
      <ion-button class="close-btn" color="danger" size="large" @click="closeModal" slot="end"> Close </ion-button>
    </ion-toolbar>
  </ion-footer>
</template>
<script lang="ts">
import Img from "@/utils/Img"
import { defineComponent, PropType } from "vue";
import TaskCard from "@/components/DataViews/TaskCard.vue";
import { TaskInterface } from "@/apps/interfaces/TaskInterface";
import { 
  IonGrid,
  IonFooter,
  IonToolbar,
  IonButton,
  IonHeader,
  IonTitle,
  IonRow, 
  IonCol, 
  modalController 
} from "@ionic/vue"; 

export default defineComponent({
  components: { 
    IonGrid, 
    IonRow, 
    IonCol, 
    TaskCard,
    IonFooter,
    IonToolbar,
    IonButton,
    IonHeader,
    IonTitle,
  },
  props: {
    title: {
      type: String,
      default: 'Select Activity'
    },
    items: {
      type: Object as PropType<TaskInterface[]>,
      required: true,
    },
    taskParams: {
      type: Object,
      required: false
    }
  },
  data: () => ({
    filteredItems: [] as any
  }),
  methods: {
    img(name: string) {
      return Img(name)
    },
    async closeModal() {
      await modalController.dismiss({})
    },
    doTask(taskItem: TaskInterface) {
      if (taskItem.action) {
        taskItem.action(this.taskParams, this.$router)
      } else if (taskItem.url) {
        this.$router.push({ path: taskItem.url })
      } else {
        this.$router.push({ 
          name: taskItem.id,
          params: {
            'patient_id': this.taskParams?.patient.patient_id
          }
        })
      }
      this.closeModal()
    }
  },
  watch: {
    items: {
      async handler(items: Array<any>) {
        if (items) {
          const _items = this.items.map(async (i: any) => {
            if(i.condition && typeof i.condition === 'function') {
              const condition = await i.condition(this.taskParams)
              i.condition = condition
            }
            return i
          })
          this.filteredItems = (await Promise.all(_items))
            .filter((i: any) => 'condition' in i 
            ? i.condition
            : true)
        }
      },
      deep: true,
      immediate: true
    }
  }
})
</script>
<style scoped>
  .selector{
    width: 100%;
    height: 90%;
    overflow-y: auto;
  }
  .close-btn {
    margin: 2%;
  }
</style>