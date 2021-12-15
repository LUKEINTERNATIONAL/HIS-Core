<template>
    <his-standard-form
        v-show="!canShowReport"
        @onFinish="onPeriod"
        :skipSummary="true" 
        :fields="fields">
    </his-standard-form>
    <ion-page v-if="canShowReport"> 
        <ion-header> 
            <ion-toolbar> 
                <ion-title> Patient visit report </ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content> 
            <view-port> 
                <div class="view-port-content"> 
                    <apexchart
                        :width="width"
                        :height="height"
                        :type="chartType"
                        :options="chartOptions"
                        :series="series"
                        @click="pointSelection"
                    >
                    </apexchart>
                </div>
            </view-port>
        </ion-content>
        <ion-footer> 
            <ion-toolbar color="dark">
                <ion-button slot="end" size="large" router-link="/" color="success">
                    Finish
                </ion-button>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import {
    IonPage,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonContent,
    IonFooter,
    IonButton,
    loadingController
} from "@ionic/vue"
import ViewPort from "@/components/DataViews/ViewPort.vue"
import { PatientReportService } from "@/apps/ART/services/reports/patient_report_service"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { uniq } from 'lodash';

export default defineComponent({
    components: {
        IonPage,
        IonHeader,
        IonTitle,
        IonToolbar,
        IonContent,
        IonFooter,
        IonButton,
        ViewPort,
        HisStandardForm
    },
    mixins: [ReportMixin],
    data: () => ({
        chartType: 'area',
        height: '100%',
        width: '100%',
        canShowReport: false,
        report: {} as any,
        series: [] as any,
        patientPresent: {} as any,
        guardianPresent: {} as any,
        bothPresent: {} as any,
        chartOptions: {
            title : {
                text: "HIV Reception encounters"
            },
            yaxis: {
                title: { 
                    text: "Number of clients"
                },
                plotAreaHeight: 800,
            },
            xaxis: {
                type: 'datetime'
            }
        } as any
    }),
    created() {
        this.fields = this.getDateDurationFields()
    },
    methods: {
        async onPeriod(_: any, conf: any) {
            await this.presentLoading()
            this.canShowReport = true
            this.report = new PatientReportService()
            this.report.setStartDate(conf.start_date)
            this.report.setEndDate(conf.end_date)
            const res = await this.report.getPatientVisitTypes()
            this.series = this.buildSeries(res)
            loadingController.dismiss()
        },
        async presentLoading() {
            const loading = await loadingController
                .create({
                    message: 'Please wait...',
                    backdropDismiss: false
                })
            await loading.present()
        },
        pointSelection(e: any, c: any, config: any) {
            try {
                const { dataPointIndex, seriesIndex } = config
                const sIndex = seriesIndex <= 0 ? 0 : seriesIndex
                this.runTableDrill(this.series[sIndex].raw[dataPointIndex])
            } catch (e) {
                //TODO
            }
        },
        buildSeries(data: any) {
            const visitDates: string[] = uniq(Object.keys(data))
            const setValueGroup = (
                date: string,
                group: Record<string, any>,
                comparator: any) => {

                if (!(date in group)) group[date] = []

                const values = Object.entries(data[date])
                    .filter(([_, v]: any) => comparator(
                        v.patient_present,
                        v.guardian_present
                    ))
                    .map(([patient]) => patient)

                group[date] = [...group[date], ...values]
                return group
            }

            const sortSeries = (valueGroup: any) => {
                return visitDates.map((date: string) => [
                    new Date(date).getTime(), 
                    valueGroup[date].length
                ])
            }

            const sortData = (valueGroup: any) => visitDates.map((date: string) => valueGroup[date])
    
            for(const date in data) {
                setValueGroup(date, this.patientPresent, (patient: any, guardian: any) => {
                    return patient && !guardian
                })
                setValueGroup(date, this.guardianPresent, (patient: any, guardian: any) => {
                    return !patient && guardian
                })
                setValueGroup(date, this.bothPresent, (patient: any, guardian: any) => {
                    return patient && guardian
                })
            }

            return [
                {
                    name: 'Patient present',
                    raw: sortData(this.patientPresent),
                    data: sortSeries(this.patientPresent)
                },
                {
                    name: 'Guardian present',
                    raw: sortData(this.guardianPresent),
                    data: sortSeries(this.guardianPresent)
                },
                {
                    name: 'Both patient and guardian present',
                    raw: sortData(this.bothPresent),
                    data: sortSeries(this.bothPresent)
                }
            ]
        }
    }
})
</script>
