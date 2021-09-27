<template>
    <ion-row :style="{marginTop: '1%'}">
        <ion-col>
            <div class="tool-bar-medium-card"> 
                <center class="relation-category"> Patient </center>
                <ul> 
                    <li>Name: {{patient.name}} </li>
                    <li>Birthdate: {{patient.birthdate}} </li>
                    <li>Home Address: {{patient.homeAddress}}</li>
                </ul>
            </div>
        </ion-col>
        <ion-col>
            <div class="tool-bar-medium-card"> 
                <center class="relation-category"> Guardian </center>
                <ul> 
                    <li>Name: {{guardian.name}} </li>
                    <li>Birthdate: {{guardian.birthdate}} </li>
                    <li>Home Address: {{guardian.homeAddress}}</li>
                </ul>
            </div>
        </ion-col>
    </ion-row>
    <view-port :style="{height: '65vh', overflowY: 'auto'}">
        <ion-row v-for="(relations, rIndex) in relationList" :key="rIndex">
            <ion-col size="6" v-for="(relation, iIndex) in relations" :key="iIndex">
                <div :class="`his-card clickable ${selected === relation.label ? `active-card-color`: ''}`" 
                    @click="onClick(relation)"> 
                    <ul>
                        <li><b>Relationship</b> {{relation.label}} </li>
                        <li><b>Desc</b> {{relation.value}} </li>
                    </ul>
                </div>
            </ion-col>
        </ion-row>
    </view-port>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { Option } from '../Forms/FieldInterface'
import FieldMixinVue from './FieldMixin.vue'
import Transformer from "@/utils/Transformers"
import ViewPort from "@/components/DataViews/ViewPort.vue"
export default defineComponent({
    mixins: [FieldMixinVue],
    components: {ViewPort},
    data: () => ({
       patient: {} as any,
       guardian: {} as any,
       selected: '' as string,
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
            this.selected = relation.label
            this.$emit('onValue', relation)
        }
    }
})
</script>
<style scoped>
.tool-bar-medium-card {
    height: 105px;    
}
.relation-category {
    margin-top: 1%;
    font-size: 1.9em;
    font-weight: bold;
    text-align: center;
}
.his-card {
    height: 110px;
    margin: 0;
    padding: 0;
    overflow: hidden;
}
li {
    list-style: none;
}
ion-col {
    padding: 0.3%;
}
</style>