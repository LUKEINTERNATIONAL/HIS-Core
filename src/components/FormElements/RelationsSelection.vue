<template>
    <view-port>
        <ion-row>
            <ion-col>
                <div class="tool-bar-medium-card"> 
                    <center class="relation-category" :style="{color: '#3880ff'}"> Patient </center>
                    <ul> 
                        <li>Name: <b>{{patient.name}}</b> </li>
                        <li>Birthdate: <b>{{patient.birthdate}}</b> </li>
                        <li>Home Address: <b>{{patient.homeAddress}}</b></li>
                    </ul>
                </div>
            </ion-col>
            <ion-col size="2"> 
                <center class="relation-category" :style="{marginTop: '20%'}"> TO </center>
            </ion-col>
            <ion-col>
                <div class="tool-bar-medium-card"> 
                    <center class="relation-category" :style="{color: '#3dc2ff'}"> Guardian </center>
                    <ul> 
                        <li>Name: <b>{{guardian.name}}</b> </li>
                        <li>Birthdate: <b>{{guardian.birthdate}}</b> </li>
                        <li>Home Address: <b>{{guardian.homeAddress}}</b></li>
                    </ul>
                </div>
            </ion-col>
        </ion-row>
        <div class="view-port-content">
            <ion-row v-for="(relations, rIndex) in relationList" :key="rIndex">
                <ion-col size="6" v-for="(relation, iIndex) in relations" :key="iIndex">
                    <div :class="`his-card clickable ${selected === relation.label ? `active-card-color`: ''}`" 
                        @click="onClick(relation)"> 
                        <ul>
                            <li>Relationship <b>{{relation.label}}</b> </li>
                            <li>Desc <b>{{relation.value}}</b>  </li>
                        </ul>
                    </div>
                </ion-col>
            </ion-row>
        </div>
    </view-port>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { Option } from '../Forms/FieldInterface'
import FieldMixinVue from './FieldMixin.vue'
import Transformer from "@/utils/Transformers"
import ViewPort from "@/components/DataViews/ViewPort.vue"
import {
    IonCol,
    IonRow
} from "@ionic/vue"
export default defineComponent({
    mixins: [FieldMixinVue],
    components: {
        ViewPort,
        IonCol,
        IonRow
    },
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
.view-port-content {
    overflow-x: auto;
    height: 80%;
}
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