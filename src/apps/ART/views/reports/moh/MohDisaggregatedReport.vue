<template>
    <report-template
        :title="title"
        :period="period"
        :rows="rows" 
        :fields="fields"
        :columns="columns"
        :reportReady="reportReady"
        :isLoading="isLoading"
        :onReportConfiguration="onPeriod"
        > 
    </report-template>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { DisaggregatedReportService, AGE_GROUPS, TEMP_OUTCOME_TABLE } from "@/apps/ART/services/reports/disaggregated_service"
import { toastWarning } from '@/utils/Alerts'
import { isEmpty, uniq } from "lodash"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate },
    data: () => ({
        reportReady: false as boolean,
        rows: [] as Array<any>,
        title: 'ART disaggregated report',
        isLoading: false as boolean,
        columns: [
            'Age group',
            'Gender',
            'Tx new (new on ART)',
            'Tx curr (receiving ART)',
            'TX curr (received IPT)',
            'TX curr (screened for TB)',
            '0A',
            '2A',
            '4A',
            '5A',
            '6A',
            '7A',
            '8A',
            '9A',
            '10A',
            '11A',
            '12A',
            '13A',
            '14A',
            '15A',
            '16A',
            '17A',
            '0P',
            '2P',
            '4P',
            '9P',
            '11P',
            '14P',
            '15P',
            '16P',
            '17P',
            'Unknown',
            'Total (regimen)'
        ],
        ageGroupCohort: {} as any,
        totalNewF: [] as Array<any>,
        totalCurF: [] as Array<any>,
        totalIptF: [] as Array<any>,
        totalTbF:  [] as Array<any>,
        totalNewM: [] as Array<any>,
        totalCurM: [] as Array<any>,
        totalIptM: [] as Array<any>,
        totalTbM:  [] as Array<any>,
        pregnantF: [] as Array<any>
    }),
    created() {
        this.fields = this.getDateDurationFields(true, false)
    },
    methods: {
        async onPeriod(form: any, config: any) {
            this.reportReady = true
            this.isLoading=true
            this.report = new DisaggregatedReportService()
            this.report.setOutcomeTable(TEMP_OUTCOME_TABLE.PATIENT_OUTCOME_TEMP)
            if (form.quarter) {
                this.report.setQuarter(form.quarter.label)
                this.report.setStartDate(form.quarter.other.start)
                this.report.setEndDate(form.quarter.other.end)
                this.period = form.quarter.label
            } else {
                this.report.setStartDate(config.start_date)
                this.report.setEndDate(config.end_date)
                this.period = this.report.getDateIntervalPeriod()
            }
            const isInit = await this.report.init()
            if (!isInit) {
                this.isLoading = false
                return toastWarning('Unable to initialise report')
            }
            await this.setTableRows()
            this.isLoading = false
        },
        drill(data: Array<any>) {
            return this.buildDrillableLink(data)
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
            const regimens = await this.report.getRegimenDistribution()
            const row: Array<any> = [...curRow, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
            let totals: any = []
            for(const regimenIndex in regimens) {
                const colIndex = this.columns.indexOf(regimenIndex)
                const data: any = regimens[regimenIndex]
                if (colIndex > 0) {
                    row[colIndex] = this.drill(data)
                } else {
                    row[row.length - 1] = this.drill(data)  // Mark as unknown.. see this.columns
                }
                totals = totals.concat(data)
            }
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
                'All', 
                'Male', 
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
            const r = await this.appendRegimensToRow([ 'All', 'FNP', ...row ])
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
                return [ group, 'Female', this.drill(txNew), this.drill(txCur), this.drill(txIpt), this.drill(txTb)]
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
                return [ group, 'Male', this.drill(txNew), this.drill(txCur), this.drill(txIpt), this.drill(txTb)]   
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
                return [ 'All', 'FP', this.drill(txNew), this.drill(txCur), this.drill(txIpt), this.drill(txTb)]
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
                return ['All', 'FBf', this.drill(txNew), this.drill(txCur), this.drill(txIpt), this.drill(txTb)]
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
        }
    }
})
</script>
