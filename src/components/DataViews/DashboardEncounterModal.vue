<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>{{ title }}</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content>
    <ion-row>
      <ion-col size="4">
        <ion-list>
          <ion-item
            v-for="(item, index) in items"
            :key="index"
            :color="item.other.id === active.id ? 'primary' : ''"
            :detail="true"
            @click="() => showDetails(item.label, item.other)"
          >
            {{ item.label }}
          </ion-item>
        </ion-list>
      </ion-col>
      <ion-col size="8">
        <div class='tb'>
        <his-basic-table :columns="active.columns" :rows="active.rows"/>
        </div>
      </ion-col>
    </ion-row>
  </ion-content>
  <ion-footer>
    <ion-toolbar> 
      <ion-button color="danger" @click="voidActiveItem" :disabled="!canVoid" size="large"> Void encounter</ion-button>
      <ion-button @click="closeModal" size="large" slot="end"> Close </ion-button>
    </ion-toolbar>
  </ion-footer>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import HisBasicTable from "@/components/DataViews/HisBasicTable.vue";
import popVoidReason from "@/utils/ActionSheetHelpers/VoidReason";
import { modalController } from "@ionic/vue"
import { toastDanger } from "@/utils/Alerts"
import { Option } from "@/components/Forms/FieldInterface"
import { isEmpty } from "lodash"
import {
  IonButton,
  IonToolbar,
  IonFooter,
  IonContent,
  IonRow,
  IonCol,
  IonTitle,
  IonHeader,
  IonItem,
  IonList
} from "@ionic/vue"

export default defineComponent({
  components: { 
    HisBasicTable,
    IonButton,
    IonToolbar,
    IonList,
    IonFooter,
    IonContent,
    IonRow,
    IonCol,
    IonTitle,
    IonHeader,
    IonItem
  },
  data: () => ({
    active: {
      id: -1,
      name: '',
      rows: [],
      columns: []
    } as any,
  }),
  computed: {
    canVoid(): boolean {
      return !isEmpty(this.active) && !isEmpty(this.active.rows)
    }
  },
  watch: {
    items: {
      handler(items: any){
        if (items.length >= 1) {
          this.showDetails(items[0].label, items[0].other)
        } 
      },
      immediate: true,
      deep: true
    }
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    items: {
      type: Object as PropType<Option[]>,
      required: true,
    },
  },
  methods: {
    async closeModal() {
      await modalController.dismiss({})
    },
    async voidActiveItem() {
      await popVoidReason(async (reason: string) => {
        try {
          await this.active.onVoid(reason)
          this.active = {}          
          if (this.items.length >= 1) {
            this.showDetails(this.items[0].label, this.items[0].other)
          } 
        } catch (e) {
          toastDanger(e)
        }
      }, 'void-modal custom-modal-backdrop') 
    },
    async showDetails(name: string, {id, columns, getRows, onVoid}: any) {
      this.active.id = id
      this.active.name = name
      this.active.columns = columns;
      this.active.onVoid = onVoid
      this.active.rows = await getRows()
    },
  },
});
</script>
<style scoped>
  .tb {
    height: 80vh;
    overflow-y: auto;
  }
</style>