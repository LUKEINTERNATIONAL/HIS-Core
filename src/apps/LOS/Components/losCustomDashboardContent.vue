<template>
    <p/>
    <ion-segment mode="ios" scrollable value="openOrders" class="ion-justify-content-center">
        <ion-segment-button value="openOrders" @click="activeTab='openOrders'">
            <ion-label>Open</ion-label>
        </ion-segment-button>
        <ion-segment-button value="drawnOrders" @click="activeTab='drawnOrders'">
            <ion-label>Drawn</ion-label>
        </ion-segment-button>
    </ion-segment>
    <p/>
    <!-- Action Table -->
    <report-table
        v-if="activeTab === 'openOrders'" 
        :rows="openRows" :columns="openColumns"
        >
    </report-table>
    <report-table
        v-if="activeTab === 'drawnOrders'" 
        :rows="drawnRows" :columns="drawnColumns"
        >
    </report-table>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ReportTable from "@/components/DataViews/tables/ReportDataTable.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import { ColumnInterface, RowInterface } from '@/components/DataViews/tables/ReportDataTable';
import { PatientLabService} from "@/apps/LOS/services/patient_lab_service"
import { isEmpty } from "lodash"
import {
    IonSegment,
    IonLabel,
    IonSegmentButton,
} from "@ionic/vue";

export default defineComponent({
    components: {
        ReportTable,
        IonSegment,
        IonLabel,
        IonSegmentButton
    },
    data: () => ({
        service: {} as any,
        activeTab: 'openOrders' as 'openOrders' | 'drawnOrders',
        drawnColumns: [
            [
                table.thTxt('Accession #'),
                table.thTxt('Test'),
                table.thTxt('Actions')
            ]
        ] as Array<ColumnInterface[]>,
        openColumns: [
            [
                table.thTxt('Accession #'),
                table.thTxt('Test'),
                table.thTxt('Reason for test'),
                table.thTxt('Drawn'),
                table.thTxt('Void')
            ]
        ] as Array<ColumnInterface[]>,
        drawnRows: [] as Array<RowInterface[]>,
        openRows: [] as Array<RowInterface[]>
    }),
    watch: {
        patient: {
            handler(patient) {
                if (!isEmpty(patient)) {
                    this.service = new PatientLabService(this.patient.getID())
                }
            },
            immediate: true,
            deep: true
        },
        visitDate: {
            async handler(date: string) {
                if (date && this.activeTab) {
                    this.service.setDate(date)
                    await this.init()
                }
            },
            immediate: true,
            deep: true
        }
    },
    methods : {
        async init() {
            const drawn = await this.service.getOrders('drawn')
            const open = await this.service.getOrders('ordered')
            this.openRows = this.getOpenRows(open)
            this.drawnRows = this.getDrawnRows(drawn)
        },
        getOpenRows(data: any): Array<RowInterface[]> {
            return data.map((d: any) => ([
                table.td(d.accession_number),
                table.td(d.tests.map((t: any) => t.name).join(',')),
                table.td(d.reason_for_test.name || 'N/A'),
                table.tdBtn('Drawn', () => {
                    console.log('Yay!! am drawn')
                }, {}, 'success'),
                table.tdBtn('Void', () => {
                    console.log('That sucks!')
                }, {}, 'danger')
            ]))
        },
        getDrawnRows(data: any): Array<RowInterface[]> {
            return data.map((d: any) => ([
                table.td(d.accession_number),
                table.td(d.tests.map((t: any) => t.name).join(',')),
                table.tdBtn('Print', () => {
                    this.service.printSpecimenLabel(d.order_id)
                })
            ]))
        }
    },
    props: {
        patient: {
            type: Object,
            required: true
        },
        visitDate: {
            type: String, 
        }
    }
})
</script>