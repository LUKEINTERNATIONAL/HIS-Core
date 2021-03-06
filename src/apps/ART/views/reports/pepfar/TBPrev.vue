<template>
    <ion-page>
        <report-template
            :title="title"
            :period="period"
            :rows="rows" 
            :fields="fields"
            :columns="columns"
            reportPrefix="PEPFAR"
            :onReportConfiguration="onPeriod"
            > 
        </report-template>
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { TbPrevReportService } from '@/apps/ART/services/reports/tb_prev_report_service'
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import { AGE_GROUPS } from "@/apps/ART/services/reports/patient_report_service"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate },
    data: () => ({
        title: 'TB PREV Report',
        cohort: {} as any,
        rows: [] as Array<any>,
        columns: [
            [
                table.thTxt('', { 
                    sortable: false,
                    exportable: false 
                }),
                table.thTxt('', { 
                    sortable: false,
                    exportable: false 
                }),
                table.thTxt('', { 
                    sortable: false,
                    exportable: false  
                }),
                table.thTxt('Started new on ART', { 
                    colspan: 2, 
                    sortable: false,
                    exportable: false 
                }),
                table.thTxt('Started previously on ART', { 
                    colspan: 2, 
                    sortable: false,
                    exportable: false 
                }),
                table.thTxt('Completed New on ART', { 
                    colspan: 2, 
                    sortable: false,
                    exportable: false 
                }),
                table.thTxt('Completed previously on ART', { 
                    colspan: 2, 
                    sortable: false,
                    exportable: false
                })
            ],
            [
                table.thTxt('Age group'),
                table.thTxt('Gender'),
                table.thNum('3HP', { value: '3HP (Started new on ART)'}),
                table.thNum('6HP', { value: '6HP (Started new on ART)'}),
                table.thNum('3HP', { value: '3HP (Started previously on ART)'}),
                table.thNum('6HP', { value: '6HP (Started previously on ART)'}),
                table.thNum('3HP', { value: '3HP (Completed New on ART)'}),
                table.thNum('6HP', { value: '6HP (Completed New on ART)'}),
                table.thNum('3HP', { value: '3HP (Completed previously on ART)'}),
                table.thNum('6HP', { value: '6HP (Completed previously on ART)'})
            ]
        ]
    }),
    created() {
        this.fields = this.getDateDurationFields()
    },
    methods: {
        async onPeriod(_: any, config: any) {
            this.rows = []
            this.report = new TbPrevReportService()
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            this.cohort = await this.report.getTBPrevReport()
            this.setRows('F')
            this.setRows('M')
        },
        makeDrilldown(data: Array<any>, context: string) {
            const values = data.map(p => p.patient_id)
            return this.drill(values, context)
        },
        async setRows(gender: string) {
            for(const i in AGE_GROUPS) {
                const group = AGE_GROUPS[i]
                const cohortData = this.cohort[group][gender]
                this.rows.push([
                    table.td(group),
                    table.td(gender),
                    this.makeDrilldown(cohortData['3HP']['started_new_on_art'],
                        `${group} Started new on ART 3HP (${gender})`
                    ),
                    this.makeDrilldown(cohortData['6H']['started_new_on_art'],
                        `${group} Start new on ART 6H (${gender})`
                    ),
                    this.makeDrilldown(cohortData['3HP']['started_previously_on_art'],
                        `${group} Started previously on ART 3HP (${gender})`
                    ),
                    this.makeDrilldown(cohortData['6H']['started_previously_on_art'],
                        `${group} Started previously on ART 6H (${gender})`
                    ),
                    this.makeDrilldown(cohortData['3HP']['completed_new_on_art'],
                        `${group} Completed new on ART 3HP (${gender})`
                    ),
                    this.makeDrilldown(cohortData['6H']['completed_new_on_art'],
                        `${group} Completed new on ART 6H (${gender})`
                    ),
                    this.makeDrilldown(cohortData['3HP']['completed_previously_on_art'],
                        `${group} Completed previously on ART 3HP (${gender})`
                    ),
                    this.makeDrilldown(cohortData['6H']['completed_previously_on_art'],
                        `${group} Completed previously on ART 6H (${gender})`
                    )
                ])
            }
        }
    }
})
</script>
