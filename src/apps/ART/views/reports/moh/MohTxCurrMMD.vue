<template>
    <ion-page>
        <report-template
            :title="title"
            :period="period"
            :rows="rows" 
            :fields="fields"
            :columns="columns"
            reportPrefix="MoH"
            :headerInfoList="headerInfoList"
            :onReportConfiguration="onPeriod"
            > 
        </report-template>
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { TxReportService, OTHER_AGE_GROUPS } from '@/apps/ART/services/reports/tx_report_service'
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import { Option } from '@/components/Forms/FieldInterface'
import { IonPage } from "@ionic/vue"
import { MohCohortReportService } from "@/apps/ART/services/reports/moh_cohort_service"
import { toastWarning } from '@/utils/Alerts'
import { isEmpty, uniq } from "lodash"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate, IonPage },
    data: () => ({
        title: 'Moh TX CURR MMD Report',
        cohort: {} as any,
        rows: [] as Array<any>,
        headerInfoList: [] as Option[],
        totals: new Set(),
        mohCohort: {} as any,
        columns:  [
            [
                table.thTxt('Age group'),
                table.thTxt('Gender'),
                table.thNum('# of clients on < 3 months of ARVs'),
                table.thNum('# of clients on 3 - 5 months of ARVs'),
                table.thNum('# of clients on  >= 6 months of ARVs')
            ]
        ],
        canValidate: false as boolean
    }),
    created() {
        this.fields = this.getDateDurationFields()
    },
    watch: {
        async canValidate(doIt: boolean) {
            if (doIt) await this.validateReport()
        }
    },
    methods: {
        async onPeriod(_: any, config: any) {
            this.canValidate = false
            this.rows = []
            this.report = new TxReportService()
            this.mohCohort = new MohCohortReportService()
            this.mohCohort.setStartDate(config.start_date)
            this.mohCohort.setEndDate(config.end_date)
            this.report.setOrg('moh')
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            await this.setRows()
            this.setHeaderInfoList()
            this.canValidate = true
        },
        setHeaderInfoList(validationStatus='<span style="color: orange;font-weight:bold">Validating report....please wait...</span>') {
            this.headerInfoList = [
                { 
                    label: 'Total clients', 
                    value: this.totals.size,
                    other: {
                        onclick: () => this.runTableDrill(Array.from(this.totals))
                    }
                },
                {
                    label: 'Validation status',
                    value: validationStatus
                }
            ]
        },
        getValues(patients: Record<string, Array<any>>) {
            const underThreeMonths: Array<any> = []
            const betweenThreeAndFiveMonths: Array<any> = []
            const overSixMonths: Array<any> = []

            for (const patientId in patients) {
                const data: any = patients[patientId]
                const pDays = data.prescribed_days
                this.totals.add(patientId)

                if(pDays < 90) {
                    underThreeMonths.push(patientId)
                }

                if (pDays >= 90 && pDays <= 150) {
                    betweenThreeAndFiveMonths.push(patientId)
                }

                if (pDays > 150) {
                    overSixMonths.push(patientId)
                }
            }
            return [
                this.drill(underThreeMonths),
                this.drill(betweenThreeAndFiveMonths),
                this.drill(overSixMonths)
            ]
        },
        async setRows() {
            let minAge = 0
            let maxAge = 0
            const males = []
            const females = []

            for(const i in OTHER_AGE_GROUPS) {
                const group = OTHER_AGE_GROUPS[i]
                if (group === '<1 year') {
                    minAge = 0
                    maxAge = 0
                } else if (group === '50 plus years') {
                    minAge = 50
                    maxAge = 120
                } else {
                    const [min, max] = group.split('-')
                    minAge = parseInt(min)
                    maxAge = parseInt(max)
                }
                const res = await this.report.getTxCurrMMDReport(minAge, maxAge)
                if (res) {
                    females.push([
                        table.td(group),
                        table.td('Female'),
                        ...this.getValues(res['Female'])
                    ])
                    males.push([
                        table.td(group),
                        table.td('Male'),
                        ...this.getValues(res['Male'])
                    ])
                } else {
                    females.push([
                        table.td(group), 
                        table.td('Female'), 
                        table.td(0), 
                        table.td(0), 
                        table.td(0)
                    ])
                    males.push([
                        table.td(group), 
                        table.td('Male'), 
                        table.td(0), 
                        table.td(0), 
                        table.td(0)
                    ])
                }
                this.rows = [...females, ...males]
            }
        },
        validateReport() {
            const validations: any = {
                'total_alive_and_on_art': {
                    param: this.totals.size,
                    check: (i: number, p: number) => i != p,
                    error: (i: number, p: number) => `
                        <b>MoH cohort Alive and on ART clients (${i}) is not
                        not matching with total TX MMD clients (${p}).</b>
                    `
                }
            }
            const s = this.mohCohort.validateIndicators(validations, (errors: string[]) => {
                if (!isEmpty(errors)) {
                    this.setHeaderInfoList(`<span style='color:red'>${errors.join(',')}</span>`)
                } else {
                    this.setHeaderInfoList(`<span style='color:green'>Report is consistent</span>`)
                }
            })
            if (s === -1) toastWarning('Running cohort report to check consistency. This may take a while')
        }
    }
})
</script>
