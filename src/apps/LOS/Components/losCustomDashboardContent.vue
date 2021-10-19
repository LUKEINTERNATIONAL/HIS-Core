<template>
    <p/>
    <ion-segment mode="ios" scrollable :value="activeTab" class="ion-justify-content-center">
        <ion-segment-button value="openOrders" @click="activeTab='openOrders'">
            <ion-label>Open</ion-label>
        </ion-segment-button>
        <ion-segment-button value="drawnOrders" @click="activeTab='drawnOrders'">
            <ion-label>Drawn</ion-label>
        </ion-segment-button>
    </ion-segment>
    <p/>
    <!-- Action Table -->
    <div :style="{overflowX: 'auto', height:'84%'}"> 
    <report-table
        v-if="activeTab === 'openOrders'" 
        :rows="labOrderRows" :columns="openColumns"
        >
    </report-table>
    <report-table
        v-if="activeTab === 'drawnOrders'" 
        :rows="drawnOrders" :columns="drawnColumns"
        >
    </report-table>
    </div>
    <!---Specimen selection modal--->
    <ion-modal :is-open="showSpecimenModal" class="custom-modal"> 
        <ion-page>
             <ion-header>
                <ion-toolbar>
                    <ion-title>                        
                        <b>Select specimen</b>
                    </ion-title>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding"> 
                <ion-row>
                    <ion-col> 
                        <ion-list>
                            <ion-radio-group>
                                <ion-item
                                    v-for="(specimen, index) in specimens"
                                    :key="index"
                                    >
                                    <ion-label>{{specimen.name}}</ion-label>
                                    <ion-radio
                                        slot="start"
                                        @click="selectedSpecimen=specimen"
                                        >
                                    </ion-radio>                            
                                </ion-item>
                            </ion-radio-group>
                        </ion-list>
                    </ion-col>
                    <ion-col> 
                        <ion-list>
                            <ion-item 
                                lines="none"
                                :key="index"
                                v-for="(test, index) in order.tests"
                                >
                                <ion-chip color="primary">{{test.name}}</ion-chip>
                            </ion-item>
                        </ion-list>
                    </ion-col>
                </ion-row>
            </ion-content>
            <ion-footer> 
                <ion-toolbar> 
                    <ion-button 
                        color="danger" 
                        slot="start"
                        @click="showSpecimenModal = false; selectedSpecimen = {};"
                        > 
                        Close 
                    </ion-button>
                    <ion-button
                        :disabled="!selectedSpecimen.name"
                        color="success" 
                        slot="end"
                        @click="drawOrder"
                        > 
                        Submit 
                    </ion-button>
                </ion-toolbar>
            </ion-footer>
        </ion-page>
    </ion-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ReportTable from "@/components/DataViews/tables/ReportDataTable.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import { ColumnInterface, RowInterface } from '@/components/DataViews/tables/ReportDataTable';
import { PatientLabService} from "@/apps/LOS/services/patient_lab_service"
import { isEmpty } from "lodash"
import { voidWithReason } from "@/utils/VoidHelper"
import {
    IonTitle,
    IonButton,
    IonFooter,
    IonToolbar,
    IonHeader,
    IonModal,
    IonPage,
    IonContent,
    IonSegment,
    IonLabel,
    IonSegmentButton,
} from "@ionic/vue";
import { toastDanger, toastWarning } from '@/utils/Alerts';

export default defineComponent({
    components: {
        IonTitle,
        IonButton,
        IonFooter,
        IonToolbar,
        IonHeader,
        IonModal,
        IonContent,
        IonPage,
        ReportTable,
        IonSegment,
        IonLabel,
        IonSegmentButton
    },
    data: () => ({
        showSpecimenModal: false as boolean,
        specimens: [] as any,
        order: {} as Record<string, any>,
        selectedSpecimen: {} as any,
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
        drawnOrders: [] as Array<RowInterface[]>,
        labOrderRows: [] as Array<RowInterface[]>
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
            this.labOrderRows = this.getLabOrderRows(open)
            this.drawnOrders = this.getdrawnOrders(drawn)
        },
        async drawOrder() {
            try {
                const req = await this.service.updateOrderSpecimen(
                    this.order.order_id, this.selectedSpecimen.concept_id
                )
                if (req) {
                    // Update drawn order rows
                    this.drawnOrders = this.drawnOrders.concat(this.getdrawnOrders([req]))
                    // Remove drawn order from orders list
                    this.labOrderRows.splice(this.order.orderIndex, 1)
                    this.showSpecimenModal = false
                    return this.service.printSpecimenLabel(this.order.order_id)
                }
            }catch(e) {
                console.error(e)
            }
            toastDanger('Unable to draw sample')
        },
        getLabOrderRows(data: any): Array<RowInterface[]> {
            return data.map((d: any, index: number) => ([
                table.td(d.accession_number),
                table.td(d.tests.map((t: any) => t.name).join(',')),
                table.td(d.reason_for_test.name || 'N/A'),
                table.tdBtn('Drawn', async () => {
                    this.order = {...d, orderIndex: index }
                    this.showSpecimenModal = true
                    this.specimens = await PatientLabService
                        .getSpecimensForTests(d.tests)
                }, {}, 'success'),
                /**
                 * Order delete button
                 */
                table.tdBtn('Void', async () => {
                    voidWithReason(
                        async (reason: string) => {
                            const res = await this.service.voidOrder(
                                d.order_id, reason
                            )
                            res 
                                ? this.labOrderRows.splice(index, 1)
                                : toastWarning('Unable to void order. Try again later')
                        },
                        [
                            'Duplicate order',
                            'Wrong client'
                        ]
                    )
                }, {}, 'danger')
            ]))
        },
        getdrawnOrders(data: any): Array<RowInterface[]> {
            return data.map((d: any) => ([
                table.td(d.accession_number),
                table.td(d.tests.map((t: any) => t.name).join(',')),
                table.tdBtn('Print', () => {
                    this.service.printSpecimenLabel(d.order_id)
                })
            ]))
        },

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