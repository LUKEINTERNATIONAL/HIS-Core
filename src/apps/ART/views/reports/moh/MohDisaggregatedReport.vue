<template>
    <ion-page>
        <report-template
            :title="title"
            :period="period"
            :rows="rows" 
            :fields="fields"
            :columns="columns"
            :headerInfoList="headerList"
            reportPrefix="MoH"
            :enabledPDFHorizontalPageBreak="true"
            :onReportConfiguration="onPeriod"
            :onDefaultConfiguration="onLoadDefault"
            :onFinishBtnAction="onFinishBtnAction"
            >
        </report-template>
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { DisaggregatedReportService, AGE_GROUPS, TEMP_OUTCOME_TABLE } from "@/apps/ART/services/reports/disaggregated_service"
import { REGIMENS } from "@/apps/ART/services/reports/regimen_report_service"
import { toastWarning } from '@/utils/Alerts'
import { isEmpty, uniq } from "lodash"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import { IonPage } from "@ionic/vue"
import { MohCohortReportService } from "@/apps/ART/services/reports/moh_cohort_service"
import { Option } from '@/components/Forms/FieldInterface'

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate, IonPage },
    data: () => ({
        reportReady: false as boolean,
        rows: [] as Array<any>,
        title: 'Disaggregated report',
        columns: [
            [
                table.thTxt('Age group'),
                table.thTxt('Gender'),
                table.thNum('Tx new (new on ART)'),
                table.thNum('Tx curr (receiving ART)'),
                table.thNum('TX curr (received IPT)'),
                table.thNum('TX curr (screened for TB)'),
                table.thNum('0A'),
                table.thNum('2A'),
                table.thNum('4A'),
                table.thNum('5A'),
                table.thNum('6A'),
                table.thNum('7A'),
                table.thNum('8A'),
                table.thNum('9A'),
                table.thNum('10A'),
                table.thNum('11A'),
                table.thNum('12A'),
                table.thNum('13A'),
                table.thNum('14A'),
                table.thNum('15A'),
                table.thNum('16A'),
                table.thNum('17A'),
                table.thNum('0P'),
                table.thNum('2P'),
                table.thNum('4P'),
                table.thNum('9P'),
                table.thNum('11P'),
                table.thNum('14P'),
                table.thNum('14PP'),
                table.thNum('15P'),
                table.thNum('15PP'),
                table.thNum('16P'),
                table.thNum('17P'),
                table.thNum('Unknown'),
                table.thNum('Total (regimen)')
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
        headerList: [] as Array<Option>,
        canValidate: false as boolean,
        onLoadDefault: null as any,
        onFinishBtnAction: null as any
    }),
    async created() {
        const { query }  = this.$route
        /** Check for default url params for this report */
        if (query.start_date && query.end_date && query.quarter) {
            this.onFinishBtnAction = () => this.$router.back()
            this.onLoadDefault = () =>
                this.onPeriod({
                    quarter: {
                        label: query.quarter,
                        other: {
                            start: query.start_date,
                            end: query.end_date
                        }
                    }
                },{})
        }
        this.fields = this.getDateDurationFields(true, false)
    },
    watch: {
        async canValidate(doIt: boolean) {
            if (doIt) await this.validateReport()
        }
    },
    methods: {
        async onPeriod(form: any, config: any) {
            this.canValidate = false
            this.rows = []
            this.report = new DisaggregatedReportService()
            this.mohCohort = new MohCohortReportService()
            this.report.setOutcomeTable(TEMP_OUTCOME_TABLE.PATIENT_OUTCOME_TEMP)
            if (form.quarter) {
                this.mohCohort.setQuarter(form.quarter.label)
                this.mohCohort.setStartDate(form.quarter.other.start)
                this.mohCohort.setEndDate(form.quarter.other.end)
                this.report.setQuarter(form.quarter.label)
                this.report.setStartDate(form.quarter.other.start)
                this.report.setEndDate(form.quarter.other.end)
                this.period = form.quarter.label
            } else {
                this.mohCohort.setStartDate(config.start_date)
                this.mohCohort.setEndDate(config.end_date)
                this.report.setStartDate(config.start_date)
                this.report.setEndDate(config.end_date)
                this.period = this.report.getDateIntervalPeriod()
            }
            const isInit = await this.report.init()
            if (!isInit) {
                return toastWarning('Unable to initialise report')
            }
            await this.setTableRows()
            this.setHeaderInfoList([])
            this.canValidate = true
        },
        async setTableRows() {
            await this.setFemaleRows()
            await this.setMaleRows()
            await this.setFemalePregnantRows()
            await this.setFemaleBreastFeedingRows()
            await this.setTotalMalesRow()
            this.setFemaleNotPregnantRows()
        },
        async appendRegimensToRow(curRow: Array<any>) {
            switch(this.report.getGender()) {
                case 'breastfeeding':
                    this.report.setAgeGroup('All')
                    this.report.setGender('Fbf')
                    break;
                case 'pregnant':
                    this.report.setAgeGroup('All')
                    this.report.setGender('FP')
                    break;
            }
            const data = await this.report.getRegimenDistribution()
            const regimens = [...REGIMENS, 'N/A']
            const row = curRow
            let totals: any = []
            regimens.forEach((i: any) => {
                if (data[i]) {
                    totals = totals.concat(data[i])
                    row.push(this.drill(data[i]))
                } else {
                    row.push(table.td(0))
                }
            })
            return [...row, this.drill(totals)]
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
        async setTotalMalesRow() {
            this.report.setGender('Male')
            this.report.setAgeGroup('All')
            const row = await this.appendRegimensToRow([
                table.td('All'), 
                table.td('Male'), 
                this.drill(this.totalNewM),
                this.drill(this.totalCurM),
                this.drill(this.totalIptM),
                this.drill(this.totalTbM)
            ])
            this.rows.push(row)
        },
        async setFemaleNotPregnantRows() {
            const row = [ 
                this.totalNewF, 
                this.totalCurF, 
                this.totalIptF,
                this.totalTbF
            ].map((data: any) => this.drill(data.filter((i: any) => !this.pregnantF.includes(i))))
            this.report.setGender('FNP')
            this.report.setAgeGroup('All')
            const r = await this.appendRegimensToRow([ table.td('All'), table.td('FNP'), ...row ])
            this.rows.push(r)
        },
        setFemaleRows() {
            this.report.setGender('female')
            return this.setRows('F', AGE_GROUPS, 
            (group: string, txNew: any, txCur: any, txIpt: any, txTb: any) => {
                this.totalNewF = uniq(this.totalNewF.concat(txNew))
                this.totalCurF = uniq(this.totalCurF.concat(txCur))
                this.totalIptF = uniq(this.totalIptF.concat(txIpt))
                this.totalTbF  = uniq(this.totalTbF.concat(txTb))
                return [ table.td(group), table.td('Female'), this.drill(txNew), this.drill(txCur), this.drill(txIpt), this.drill(txTb)]
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
                return [ table.td(group), table.td('Male'), this.drill(txNew), this.drill(txCur), this.drill(txIpt), this.drill(txTb)]   
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
                return [ table.td('All'), table.td('FP'), this.drill(txNew), this.drill(txCur), this.drill(txIpt), this.drill(txTb)]
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
                return [ table.td('All'), table.td('FBf'), this.drill(txNew), this.drill(txCur), this.drill(txIpt), this.drill(txTb)]
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
                const row = await this.appendRegimensToRow(
                    onFormat(group, txNew, txCurr, txGivenIpt, txScreenTB)
                ) 
                this.rows.push(row)
            }
        },
        setHeaderInfoList(totalAlive: Array<any>, validationStatus='<span style="color: orange;font-weight:bold">Validating report....please wait...</span>') {
            this.headerList = [
                { 
                    label: 'Total Alive and on ART', 
                    value: totalAlive.length,
                    other: {
                        onclick: () => this.runTableDrill(totalAlive)
                    }
                },
                {
                    label: 'Validation status',
                    value: validationStatus
                }
            ]
        },
        async validateReport() {
            const totalAlive = uniq([
                ...this.totalNewF, 
                ...this.totalCurF, 
                ...this.totalIptF,
                ...this.totalTbF,
                ...this.totalNewM, 
                ...this.totalCurM, 
                ...this.totalIptM,
                ...this.totalTbM,
                ...this.pregnantF
            ])
            const validations: any = {
                'total_alive_and_on_art' : {
                    param: totalAlive.length,
                    check: (i: number, p: number) => i != p,
                    error: (i: number, p: number) => `
                        Total alive of <b>${p}</b>
                        Does not match total alive of <b>${i}</b> on MOH report
                    `
                }
            }
            const s = this.mohCohort.validateIndicators(validations, (errors: string[]) => {
                if (!isEmpty(errors)) {
                    this.setHeaderInfoList(totalAlive,`<span style='color:red'>${errors.join(',')}</span>`)
                } else {
                    this.setHeaderInfoList(totalAlive,`<span style='color:green'>Report is consistent</span>`)
                }
            })
            if (s === -1) toastWarning('Running cohort report to check consistency. This may take a while...')
        }
    }
})
</script>
