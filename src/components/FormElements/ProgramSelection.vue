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
                            <td>{{formatDate(state.start_date)}}</td>
                            <td>{{formatDate(state.end_date) || 'N/A'}}</td>
                            <td><ion-button color="danger" @click="voidState(state, sIndex)"> Void </ion-button></td>
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
import { toastDanger, toastSuccess } from "@/utils/Alerts"
import { isEmpty } from 'lodash'
import popVoidReason from "@/utils/ActionSheetHelpers/VoidReason"
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
            return !isEmpty(this.activeProgram) ? this.activeProgram.other.patient_states : []
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
        },
        async voidState(state: any, sIndex: number) {
            await popVoidReason(async (reason: string) => {
                try {
                    if (!(this.config && this.config.onVoidState)) {
                        throw 'Missing onVoid in configuration'
                    }  
                    await this.config.onVoidState(state, reason)
                    this.activeProgram.other.patient_states.splice(sIndex, 1)
                    toastSuccess('State has been voided')
                }catch(e) {
                  toastDanger(e)
                }
            })
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