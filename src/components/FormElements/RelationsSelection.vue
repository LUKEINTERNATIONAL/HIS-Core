<template>
    <ion-row :style="{marginTop: '1%'}">
        <ion-col>
            <div class="tool-bar-medium-card"> 
                <ul> 
                    <li>Patient: {{patient.name}} </li>
                    <li>Birthdate: {{patient.birthdate}} </li>
                    <li>Home Address: {{patient.homeAddress}}</li>
                </ul>
            </div>
        </ion-col>
        <ion-col>
            <div class="tool-bar-medium-card"> 
                <ul> 
                    <li>Gurdian: {{patient.name}} </li>
                    <li>Birthdate: {{patient.birthdate}} </li>
                    <li>Home Address: {{patient.homeAddress}}</li>
                </ul>
            </div>
        </ion-col>
    </ion-row>
    <ion-row v-for="(relations, rIndex) in relationList" :key="rIndex">
        <ion-col size="6" v-for="(relation, iIndex) in relations" :key="iIndex">
            <div class="his-card clickable" @click="onClick(relation)"> 
                <ul>
                    <li><b>Relationship</b> {{relation.label}} </li>
                    <li><b>Desc</b> {{relation.value}} </li>
                </ul>
            </div>
        </ion-col>
    </ion-row>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { Option } from '../Forms/FieldInterface'
import FieldMixinVue from './FieldMixin.vue'
import Transformer from "@/utils/Transformers"

export default defineComponent({
    mixins: [FieldMixinVue],
    data: () => ({
       patient: {} as any,
       guardian: {} as any,
       listData: [] as Array<Option> 
    }),
    computed: {
        relationList(): Array<any> {
            return Transformer.convertArrayToTurples(this.listData, 2)
        }
    },
    async activated() {
        this.$emit('onFieldActivated', this)
        this.listData = await this.options(this.fdata)
    },
    methods: {
        onClick(relation: any) {
            this.$emit('onValue', relation)
        }
    }
})
</script>
<style scoped>
 .his-card {
    height: 100px;
    margin: 1.4%;
 }
 li {
    list-style: none;
 }
 ion-col {
  padding: 0.5%;
}
</style>