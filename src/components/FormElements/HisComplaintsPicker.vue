<template>
    <div>
      <view-port :showFull="!showKeyboard" style="padding: 0;">
        <ion-grid>
          <ion-row>
            <ion-col size="12">
              <span v-for="(item, index) in checkedItems" :key="index"> 
                <ion-chip color="danger" @click="uncheck(item)">{{item.label}}</ion-chip>
              </span>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col size="4">
              <ion-list :style="{overflowY: 'auto', height:'80vh', margin: 0}"> 
                <ion-item
                  v-for="(data, index) in listData" :key="index"
                  @click="getSpecificComplaints(data.value)"
                  :detail="true"
                  :color="data.isChecked ? 'light':''"
                > 
                  <ion-label> {{ data.label }} </ion-label>
                </ion-item>
              </ion-list>
            </ion-col>
            <ion-col :style="{overflowY: 'auto', height:'78vh'}" v-if="ActiveCategory">
              <div style="">
                <ion-list class='view-port-content'>
                  <ion-item v-for="(entry, index) in activeCategoryItems" :key="index" :color="entry.isChecked ? 'light':''">
                    <ion-label> 
                      <ion-text>
                        {{ entry.label }} 
                      </ion-text>
                    </ion-label>
                    <ion-checkbox
                      slot="end"
                      v-model="entry.isChecked"
                      @ionChange="(e) => onselect(entry, e)"
                      :disabled="entry?.disabled"/>
                  </ion-item>
                </ion-list>
              </div>
            </ion-col>
          </ion-row>
        </ion-grid>
      </view-port>
    </div>
</template>
<script lang="ts">
import { Option } from "../Forms/FieldInterface";
import { defineComponent } from "vue";
import { IonCheckbox, IonText, IonChip } from "@ionic/vue";
import SelectMixin from "@/components/FormElements/SelectMixin.vue"
import { PatientComplaintsService } from "@/apps/OPD/services/patient_complaints_service";
import { isEmpty } from "lodash";
import { ConceptName } from "@/interfaces/conceptName";

export default defineComponent({
  components: { IonCheckbox, IonText, IonChip },
  name: "HisComplaintsPicker",
  mixins: [SelectMixin],
  data: () => ({
    complaintsList: {} as Record<string, Option[]>,
    ActiveCategory: '',
  }),
  methods: {
    async onselect(option: Option, event: any){
      this.$nextTick(async ()=> {
        const opt = {...option}
        opt.isChecked = event.target.checked

        if (this.onValue && opt.isChecked) {
          const ok = await this.onValue(opt)
          if (!ok) {
            return event.target.checked = false
          }
        }
        if (this.onValueUpdate) {
          this.complaintsList = await this.onValueUpdate({...this.complaintsList}, opt)
        }
        this.$emit('onValue', this.getChecked(this.complaintsList))
      })
    },
    async getSpecificComplaints(category: string) {
      if (!(category in this.complaintsList)) {
        const complaints = await PatientComplaintsService.getComplaintsList(category)
        this.complaintsList[category] = this.mapListToOptions(complaints, category)
      }
      this.ActiveCategory = category
    },
    mapListToOptions(list: ConceptName[], category = ''){
      if(isEmpty(list)) return []
      return list.map(item => {
        const option: Option = {
          label: item.name,
          value: item.name,
          isChecked: false,
          other: item
        }
        if(category) option.other.parent = category
        return option
      })
    },
    uncheck(option: Option){
      this.complaintsList[option.other.parent].forEach(opt => {
        if(opt.label === option.label) opt.isChecked = false
      })
    },
    getChecked(list: Record<string, Option[]>) {
      const checkedItems: Array<Option> = [];
      for (const group in list) {
        checkedItems.push(
          ...list[group].filter(option => option.isChecked)
        )
      }

      return checkedItems
    },
  },
  computed: {
    checkedItems(): Option[] {
      return this.getChecked(this.complaintsList)
    },
    activeCategoryItems(): Option[] {
      return this.complaintsList[this.ActiveCategory]
    }
  },
  watch: {
    clear(isClear: boolean){
      if (isClear) {
        for (const group in this.complaintsList) {
          this.complaintsList[group] = this.complaintsList[group].map(option => {
            option.isChecked = false
            return option
          })
        }
        this.$emit('onClear')
      }
    }
  },
  async activated() {
    this.$emit('onFieldActivated', this)
    const data = await PatientComplaintsService.getComplaintsList('Presenting complaint group')
    this.listData = this.mapListToOptions(data)
    this.$emit('onValue', this.getChecked(this.complaintsList))
  }
});
</script>

<style scoped>
ion-col {
  padding: 0;
  margin: 0;
  border-right: 1px solid lightgray;
}
</style>