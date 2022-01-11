<template>
    <ion-page>
        <report-template
            :title="title"
            :period="period"
            :rows="rows" 
            :fields="fields"
            :columns="columns"
            :headerInfoList="headerList"
            reportPrefix="PEPFAR"
            :onReportConfiguration="onPeriod">
        </report-template>
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { DisaggregatedReportService } from "@/apps/ART/services/reports/disaggregated_service"
import { toastWarning } from '@/utils/Alerts'
import { isEmpty, uniq } from "lodash"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import { Option } from '@/components/Forms/FieldInterface'
import { IonPage } from "@ionic/vue"
import { MohCohortReportService } from "@/apps/ART/services/reports/moh_cohort_service"
import { AGE_GROUPS } from "@/apps/ART/services/reports/patient_report_service"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate, IonPage },
    data: () => ({
        title: 'PEPFAR Diseggregated Report',
        rows: [] as Array<any>,
        headerList: [] as Option[],
        columns: [
            [
                table.thTxt('Age group'),
                table.thTxt('Gender'),
                table.thNum('Tx new (new on ART)'),
                table.thNum('Tx curr (receiving ART)'),
                table.thNum('TX curr (received IPT)'),
                table.thNum('TX curr (screened for TB)')
            ]
        ],
        mohCohort: {} as any,
        ageGroupCohort: {} as any,
        totalNewF: [] as Array<any>,
        totalCurF: [] as Array<any>,
        totalIptF: [] as Array<any>,
        totalTbF:  [] as Array<any>,
        totalNewM: [] as Array<any>,
        totalCurM: [] as Array<any>,
        totalIptM: [] as Array<any>,
        totalTbM:  [] as Array<any>,
        pregnantF: [] as Array<any>,
        txtNewFp: [] as Array<any>,
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
            this.report = new DisaggregatedReportService()
            this.mohCohort = new MohCohortReportService()
            this.report.setQuarter('pepfar')
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.mohCohort.setStartDate(config.start_date)
            this.mohCohort.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            const isInit = await this.report.init()
            if (!isInit) {
                return toastWarning('Unable to initialise report')
            }
            await this.setTableRows()
            this.setHeaderInfoList()
            this.canValidate = true
        },
        setHeaderInfoList(validationStatus='<span style="color: orange;font-weight:bold">Validating report....please wait...</span>') {
            const totalAlive = this.totalCurF.concat(this.totalCurM)
            this.headerList = [
                { 
                    label: 'Total Alive and on ART', 
                    value: totalAlive.length,
                    other: {
                        onclick: () => this.runTableDrill(totalAlive, 'Total Alive and on ART')
                    }
                },
                {
                    label: 'Validation status',
                    value: validationStatus
                }
            ]
        },
        async setTableRows() {
            await this.setFemaleRows()
            await this.setMaleRows()
            await this.setFemalePregnantRows()
            await this.setFemaleBreastFeedingRows()
            this.setTotalMalesRow()
            this.setFemaleNotPregnantRows()
        },
        async getValue(prop: string, gender: string, data: any) {
            let res: any = []
            switch(prop) {
                case 'tx_given_ipt':
                    res = await this.report.getTxIpt()
                    break;
                case 'tx_screened_for_tb':
                    res = await this.report.getTxCurrTB()
                    break;
                default:
                    res = gender in data ? data[gender][prop] : []
                    break;
            }
            return res
        },
        setTotalMalesRow() {
            this.rows.push([
                table.td('All'), 
                table.td('Male'), 
                this.drill(this.totalNewM, 'Tx New (new on ART) Males'),
                this.drill(this.totalCurM, 'Total Curr (received ART) Males'),
                this.drill(this.totalIptM, 'Total Curr (received IPT) Males'),
                this.drill(this.totalTbM, 'Total Curr (screened for TB) Males')
            ])
        },
        setFemaleNotPregnantRows() {
            const row = [
                [this.totalNewF, 'Tx New (new on ART) FNP'], 
                [this.totalCurF, 'Tx Curr (receiving ART) FNP'], 
                [this.totalIptF, 'Tx Curr (received IPT) FNP'],
                [this.totalTbF, 'Tx Curr (screened for TB) FNP']
            ].map(([row, context]: any) => {
                const femaleNotPregnant = row.filter((i: any) => !this.pregnantF.includes(i))
                return this.drill(femaleNotPregnant, context)
            })
            this.rows.push([ table.td('All'), table.td('FNP'), ...row ])
        },
        setFemaleRows() {
            this.report.setGender('female')
            return this.setRows('F', AGE_GROUPS, 
            (group: string, txNew: any, txCur: any, txIpt: any, txTb: any) => {
                this.totalNewF = uniq(this.totalNewF.concat(txNew))
                this.totalCurF = uniq(this.totalCurF.concat(txCur))
                this.totalIptF = uniq(this.totalIptF.concat(txIpt))
                this.totalTbF  = uniq(this.totalTbF.concat(txTb))
                return [ 
                    table.td(group), 
                    table.td('Female'),
                    this.drill(txNew, `${group} Tx New (new on ART) Females`), 
                    this.drill(txCur, `${group} Tx Curr (receiving ART) Females`), 
                    this.drill(txIpt, `${group} Tx Curr (received IPT) Females`), 
                    this.drill(txTb, `${group} Tx Curr (screened for TB) Females`)
                ]
            })
        },
        setMaleRows() {
            this.report.setGender('male')
            return this.setRows('M', AGE_GROUPS, 
            (group: string, txNew: any, txCur: any, txIpt: any, txTb: any) => {
                this.totalNewM = uniq(this.totalNewM.concat(txNew))
                this.totalCurM = uniq(this.totalCurM.concat(txCur))
                this.totalIptM = uniq(this.totalIptM.concat(txIpt))
                this.totalTbM  = uniq(this.totalTbM.concat(txTb))
                return [ 
                    table.td(group), 
                    table.td('Male'), 
                    this.drill(txNew, `${group} Tx New (new on ART) Males`), 
                    this.drill(txCur, `${group} Tx Curr (receiving ART) Males`), 
                    this.drill(txIpt, `${group} Tx Curr (received IPT) Males`), 
                    this.drill(txTb, `${group} Tx Curr (screened for TB) Males`)
                ]   
            })
        },
        setFemalePregnantRows() {
            this.report.setGender('pregnant')
            return this.setRows('F', ['Pregnant'], 
                (_: string, txNew: any, txCur: any, txIpt: any, txTb: any) => {
                this.pregnantF = uniq(this.pregnantF.concat(txNew))
                this.pregnantF = uniq(this.pregnantF.concat(txCur))
                this.pregnantF = uniq(this.pregnantF.concat(txIpt))
                this.pregnantF = uniq(this.pregnantF.concat(txTb))
                this.txtNewFp = txNew
                return [ 
                    table.td('All'), 
                    table.td('FP'),
                    this.drill(txNew, `Tx New (new on ART) Pregnant`),
                    this.drill(txCur, `Tx Curr (receiving ART) Pregnant`),
                    this.drill(txIpt, `Tx Curr (received IPT) Pregnant`),
                    this.drill(txTb, `Tx Curr (screened for TB) Pregnant`)
                ]
            })
        },
        setFemaleBreastFeedingRows() {
            this.report.setGender('breastfeeding')
            return this.setRows('F', ['Breastfeeding'], 
            (_: string, txNew: any, txCur: any, txIpt: any, txTb: any) => {
                this.pregnantF = uniq(this.pregnantF.concat(txNew))
                this.pregnantF = uniq(this.pregnantF.concat(txCur))
                this.pregnantF = uniq(this.pregnantF.concat(txIpt))
                this.pregnantF = uniq(this.pregnantF.concat(txTb))
                return [ 
                    table.td('All'), 
                    table.td('FBf'), 
                    this.drill(txNew, 'Tx New (new on ART) Breastfeeding'), 
                    this.drill(txCur, 'Tx Curr (receiving ART) Breastfeeding'), 
                    this.drill(txIpt, 'Tx Curr (received IPT) Breastfeeding'), 
                    this.drill(txTb, 'Tx Curr (screened for TB) Breastfeeding')
                ]
            })
        },
        async setRows(category: string, ageGroups: Array<string>, onFormat: Function) {
            for(const i in ageGroups) {
                let txNew = []
                let txCurr= []
                let txGivenIpt = []
                let txScreenTB = []

                const group = ageGroups[i]
                this.report.setAgeGroup(group)

                if (!(group in this.ageGroupCohort)) {
                    const cohort = await this.report.getCohort()
                    this.ageGroupCohort[group] = !isEmpty(cohort) ? cohort[group] : {}
                }
                if (!isEmpty(this.ageGroupCohort[group])) {
                    const value = async (prop: string) => this.getValue(
                        prop, category, this.ageGroupCohort[group]
                    )
                    txNew = await value('tx_new')
                    txCurr= await value('tx_curr')
                    txGivenIpt = await value('tx_given_ipt')
                    txScreenTB = await value('tx_screened_for_tb')
                }
                this.rows.push(onFormat(group, txNew, txCurr, txGivenIpt, txScreenTB))
            }
        },
        validateReport() {
            const validations: any = {
                'initiated_on_art_first_time': {
                    param: this.totalNewF.concat(this.totalNewM).length,
                    check: (i: number, p: number) => i != p,
                    error: (i: number, p: number) => `
                        MOH cohort initiated on ART first time (${i}) is not matching Tx New (${p})
                    `
                },
                'initial_pregnant_females_all_ages': {
                    param: this.txtNewFp.length,
                    check: (i: number, p: number) => i != p,
                    error: (i: number, p: number) => `
                        MOH cohort initial pregnant females all ages 
                        (${i}) is not matching with TX new Pregnant women ${p}
                    `
                },
                'males_initiated_on_art_first_time': {
                    param: this.totalNewM.length,
                    check: (i: number, p: number) => i != p,
                    error: (i: number, p: number) => `
                        MoH Cohort males initiated on ART first time (${i})
                        is not matching with TX new All male (${p})
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
