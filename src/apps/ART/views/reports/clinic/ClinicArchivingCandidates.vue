<template>
    <ion-page> 
        <report-template
            :title="title"
            :rows="rows"
            :columns="columns"
            > 
        </report-template>
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import ReportTemplate from "@/apps/ART/views/reports/BasicReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import { PatientReportService } from '@/apps/ART/services/reports/patient_report_service'
import { IonPage} from "@ionic/vue"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate, IonPage },
    data: () => ({
        title: 'Active clients with adverse outcomes',
        rows: [] as Array<any>,
        columns: [
            [
                table.thTxt('Filing#'),
                table.thTxt('Outcome'),
                table.thTxt('Outcome date')
            ]
        ]
    }),
    async created() {
        const report = new PatientReportService()
        const data = await report.getArchivingCandidates()
        data.forEach((data: any) => {
            this.rows.push([
                table.td(data.filing_number),
                table.td(data.outcome),
                table.tdDate(data.outcome_date)
            ])
        })
    }
})
</script>
