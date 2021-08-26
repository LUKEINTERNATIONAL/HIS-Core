<template>
    <view-port>
        <div class='view-port-content'>
            <ion-row>
                <ion-col size="4">
                    <ion-list>
                        <ion-item
                            v-for="(program, pIndex) in listData" 
                            :color="program.label === activeProgram.label ? 'light': ''" 
                            :key="pIndex"
                            @click="onselect(program)"
                            detail> 
                            <ion-label> {{program.label}} </ion-label>
                        </ion-item>
                    </ion-list>
                </ion-col>
                <ion-col size="8">
                    <center v-if="activeProgram.label && states.length <= 0"> 
                        <h3> Program has no states </h3>
                    </center>
                    <table class="his-table" v-if="activeProgram.label && states.length > 0"> 
                        <tr>
                            <th>State</th>
                            <th>State Date</th>
                            <th>End Date</th>
                            <th>Actions</th>
                        </tr>
                        <tr v-for="(state, sIndex) in states" :key="sIndex"> 
                            <td>{{state.name}}</td>
                            <td>{{state.startDate}}</td>
                            <td>{{state.endDate || 'N/A'}}</td>
                            <td>
                                <ion-button 
                                  v-for="(stateAction, aIndex) in state.actions" :key="aIndex"
                                  :color="stateAction.color" 
                                  @click="stateAction.action(activeProgram, sIndex)"> 
                                  {{stateAction.name}} 
                                </ion-button>
                            </td>
                        </tr>
                    </table>
                </ion-col>
            </ion-row>
        </div>
    </view-port>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Option } from '../Forms/FieldInterface'
import { isEmpty } from 'lodash'
import HisDate from "@/utils/Date"

export default defineComponent({
    name: "HisSelect",
    props: {
        fdata: {
            type: Object,
            required: true
        },
        onValue: {
            type: Function
        },
        config: {
            type: Object
        },
        options: {
            type: Function,
            required: true
        }
    },
    watch: {
        clear(val: boolean){ 
           if (val) {
               this.activeProgram = {}
               this.$emit('onClear')
           }
        }
    },
    data:()=>({
        listData: [] as Array<Option>,
        activeProgram: {} as any,
    }),
    async activated() {
        this.$emit('onFieldActivated', this)
        this.listData = await this.options(this.fdata)
    },
    computed: {
        states(): Array<any> {
            return !isEmpty(this.activeProgram) ? this.activeProgram.other.programStates : []
        }
    },
    methods: {
        formatDate(date: string) {
            return !date ? 'N/A' : HisDate.toStandardHisDisplayFormat(date)
        },
        async onselect(item: Option) {
            this.activeProgram = item
            if (this.onValue) {
                const ok = await this.onValue(item, this)
                if (!ok) {
                    this.activeProgram = {}
                    return
                }
            }
            this.$emit('onValue', item)
        }
    }
})
</script>
<style scoped>
    .view-port-content {
        height: 89%;
    }
    ion-col {
        border-right: solid 1px #ccc;
    }
</style>