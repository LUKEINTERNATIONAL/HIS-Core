<template>
    <ion-row>
        <ion-col size="5">
            <div class="large-card">
                <h3> People: </h3>
                <ion-list>
                    <ion-item
                        button
                        v-for="(result, index) in listData"
                        :key="index"
                        :detail="true"
                        :color="result.value === selectedResult.value ? 'light' : ''"
                        @click="onSelect(result)"
                        >
                        <ion-avatar>
                            <ion-img src="/assets/images/avatar.svg"/>
                        </ion-avatar>
                        <ion-label> {{ result.label }} </ion-label>
                    </ion-item>
                </ion-list>
            </div>
        </ion-col>
        <ion-col size="7">
            <div class="large-card">
                <h3> Details: </h3>
                <ion-list>
                    <ion-item
                      v-for="(opt, index) in selectedResult.other.options"
                      :key="index"
                      inset="none"
                      >
                      <ion-label> 
                          {{ opt.label }} 
                      </ion-label>
                      <ion-label slot="end"> 
                          {{ opt.value }} 
                      </ion-label>
                    </ion-item>
                </ion-list>
            </div>
        </ion-col>
    </ion-row>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import {
  IonRow,
  IonLabel,
  IonCol,
  IonList,
  IonItem,
} from "@ionic/vue";
import FieldMixinVue from "./FieldMixin.vue";
import { Option } from "@/components/Forms/FieldInterface"

export default defineComponent({
  mixins:[FieldMixinVue],
  components: {
    IonLabel,
    IonRow,
    IonCol,
    IonList,
    IonItem,
  },
  data: () => ({
    listData: [] as Array<Option>,
    selectedResult: {} as any
  }),
  methods: {
    async onSelect(item: any) {
      if (!item) {
        return
      }
      if (this.onValue) {
        const ok = await this.onValue(item, this)
        if (!ok) {
          return
        }
      }
      this.selectedResult = item
      this.$emit('onValue', item)
    }
  },
  async activated() {
    this.onSelect({})
    this.$emit('onFieldActivated', this)
    this.listData = await this.options(this.fdata, this)
  }
});
</script>

<style scoped>
.large-card {
  padding: 5%;
  border-radius: 15px;
  border: 1px solid #ccc;
  height: 82vh;
  background-color: rgb(255, 255, 255);
  overflow-y: auto;
  -webkit-box-shadow: 0px -2px 19px -2px rgba(196, 190, 196, 1);
  -moz-box-shadow: 0px -2px 19px -2px rgba(196, 190, 196, 1);
  box-shadow: 0px -2px 19px -2px rgba(196, 190, 196, 1);
}
</style>
