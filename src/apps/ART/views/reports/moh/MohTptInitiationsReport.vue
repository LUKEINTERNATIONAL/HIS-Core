<template>
    <ion-page> 
        <report-template
            :title="title"
            :period="period"
            :rows="rows" 
            :fields="fields"
            :columns="columns"
            reportPrefix="MoH"
            :headerInfoList="headerList"
            :onReportConfiguration="onPeriod"
            > 
        </report-template>
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { AGE_GROUPS } from "@/apps/ART/services/reports/patient_report_service"
import { RegimenReportService } from "@/apps/ART/services/reports/regimen_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { isEmpty, uniq } from 'lodash'
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import { IonPage } from "@ionic/vue"
import { MohCohortReportService } from "@/apps/ART/services/reports/moh_cohort_service"
import { toastWarning } from '@/utils/Alerts'
import { Option } from '@/components/Forms/FieldInterface'

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate, IonPage },
    data: () => ({
        title: 'TPT new initiations report',
        rows: [] as Array<any>,
        cohort: {} as any,
        canValidate: false as boolean,
        mohCohort: {} as any,
        headerList: [] as Array<Option>,
        columns: [
            [
                table.thTxt('Age group'),
                table.thTxt('Gender'),
                table.thNum('3HP'),
                table.thNum('6H')
            ]
        ],
        totalIpt: [] as number[],
        total3hp: [] as number[]
    }),
    watch: {
        async canValidate(doIt: boolean) {
            if (doIt) await this.validateReport()
        }
    },
    created() {
        this.fields = this.getDateDurationFields()
    },
    methods: {
        async onPeriod(_: any, config: any) {
            this.canValidate = false
            this.rows = []
            this.report = new RegimenReportService()
            this.mohCohort = new MohCohortReportService()
            this.mohCohort.setStartDate(config.start_date)
            this.mohCohort.setEndDate(config.end_date)
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            this.cohort = await this.report.getTptNewInitiations()
            this.setRows('F')
            this.setRows('M')
            this.setHeaderInfoList()
            this.canValidate = true
        },
        drilldown(patients: Array<any>) {
            const columns = ['ARV #', 'DOB', 'Dispensed date']
            const onRows = () => patients.map((p: any) => [
                p.arv_number,
                this.toDate(p.birthdate),
                this.toDate(p.prescription_date)
            ])
            if (patients.length <= 0) {
                return table.td(0)
            }
            return table.tdLink(
                patients.length, 
                () => this.tableDrill({
                    columns, 
                    onRows 
                })
            )
        },
        setRows(gender: 'M' | 'F') {
            for(const ageIndex in AGE_GROUPS) {
                const group = AGE_GROUPS[ageIndex]
                if (!isEmpty(this.cohort) && group in this.cohort) {
                    const data = this.cohort[group]
                    this.total3hp = uniq([...this.total3hp, ...data['3HP'][gender]])
                    this.totalIpt = uniq([...this.totalIpt, ...data['6H'][gender]])
                    this.rows.push([
                        table.td(group),
                        table.td(gender),
                        this.drilldown(data['3HP'][gender]),
                        this.drilldown(data['6H'][gender])
                    ])
                } else {
                    this.rows.push([
                        table.td(group),
                        table.td(gender),
                        table.td(0),
                        table.td(0)
                    ])
                }
            }
        },
        setHeaderInfoList(validationStatus='<span style="color: orange;font-weight:bold">Validating report....please wait...</span>') {
            this.headerList = [
                {
                    label: 'Validation status',
                    value: validationStatus
                }
            ]
        },
        validateReport() {
            const validations = {
                'newly_initiated_on_3hp' : {
                    param: this.total3hp.length,
                    check: (i: number, p: number) => i != p,
                    error: (i: number, p: number) => `
                        <b style="color:red;">
                            Total newly initiated on 3HP(${p}) is not matching newly 
                            initiated on 3HP in Cohort report (${i}).
                        </b>
                    `
                },
                'newly_initiated_on_ipt': {
                    param: this.totalIpt.length,
                    check: (i: number, p: number) => i != p,
                    error: (i: number, p: number) => `
                        <b style="color:red;">
                            Total newly initiated on IPT (${p}) is not matching 
                            newly initiated on IPT in Cohort report(${i}).
                        </b>
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
            if (s === -1) toastWarning('Running cohort report to check consistency. This may take a while...')
        }
    }
})
</script>
