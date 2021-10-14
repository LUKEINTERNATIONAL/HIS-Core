<template>
    <ion-grid> 
        <ion-row class="his-card"> 
            <ion-col> 
                <b>Today's Date:</b> {{ currentDate }}
            </ion-col>
            <ion-col> </ion-col>
            <ion-col>
                <span v-if="isBDE"> 
                    <ion-chip :style="{marginTop: '-8px'}" color="danger" @click="$router.push({name: 'Session Date'})"><b> BDE: {{ sessionDate.toUpperCase() }}</b> </ion-chip>
                </span>
                <span v-else> 
                    <b>Set Date:</b> {{ sessionDate }}
                </span>
            </ion-col>
        </ion-row>
        <ion-row>
            <ion-col size="2.4"> 
                <visit-dates-card 
                    :title="visitDatesTitle" 
                    :items="visitDates" 
                    @onselect="onActiveVisitDate"> 
                </visit-dates-card>
            </ion-col> 
            <ion-col size="9.6"> 
                <div class="his-card card-body">
                    <!-- Add segment -->
                    <ion-segment scrollable value="1" class="ion-justify-content-center">
                        <ion-segment-button value="1" @click="openOrder">
                            <ion-label>Open</ion-label>
                        </ion-segment-button>
                        <ion-segment-button value="2" @click="drawnOrders">
                            <ion-label>Drawn</ion-label>
                        </ion-segment-button>
                    </ion-segment>
                    <!-- Action Table -->
                    <p>
                        <report-table :rows="rows" :columns="columns"> </report-table>
                    </p>
                </div>
            </ion-col>
        </ion-row>
    </ion-grid> 
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import VisitDatesCard from "@/components/DataViews/VisitDatesCard.vue"
import ReportTable from "@/components/DataViews/tables/ReportDataTable.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import {
    IonCol,
    IonGrid,
    IonRow,
    IonSegment,
    IonSegmentButton,
} from "@ionic/vue";
import { ColumnInterface, RowInterface } from '@/components/DataViews/tables/ReportDataTable';
export default defineComponent({
    components: {
        IonCol,
        ReportTable,
        IonGrid,
        IonRow,
        VisitDatesCard,
        IonSegment,
        IonSegmentButton,
    },
    data: () => ({
        activeTab: 0 as number,
        visitDates: [] as string[],
        columns: [] as Array<ColumnInterface[]>,
        rows: [] as Array<RowInterface[]>
    }),
    async created() {
        await this.openOrder()
    },
    methods : {
        openOrder() {
            this.columns = [
                [
                    table.thTxt('Accession #'),
                    table.thTxt('Test'),
                    table.thTxt('Reason for test'),
                ]
            ]
            this.rows = []
        },
        drawnOrders() {
            this.columns = [
                [
                    table.thTxt('Accession #'),
                    table.thTxt('Test'),
                ]
            ]
            this.rows = []
        }
    },
    computed: {
        visitDatesTitle(): string {
            return `${this.visitDates.length} visit(s)`
        }
    },
    props: {
        patient: {
            type: Object,
            required: true
        },
        program: {
            type: Object,
            required: true
        },
        currentDate: {
            type: String,
            required: true
        },
        sessionDate: {
            type: String,
            required: true
        },
        isBDE: {
            type: Boolean
        }
    }
})
</script>
<style scoped>
    .card-body{
        width: 100%;
        height: 67vh;
    }
</style>