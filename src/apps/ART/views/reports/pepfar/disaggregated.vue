<template>
    <report-template
        :title="title"
        :period="period"
        :rows="rows" 
        :fields="fields"
        :columns="columns"
        :isLoading="isLoading"
        :reportReady="reportReady"
        :onReportConfiguration="onPeriod"
        > 
    </report-template>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { DisaggregatedReportService, AGE_GROUPS } from "@/apps/ART/services/reports/disaggregated_service"
import { toastWarning } from '@/utils/Alerts'
import { isEmpty, uniq } from "lodash"
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import table from "@/components/DataViews/tables/ReportDataTable"

export default defineComponent({
    mixins: [ReportMixin],
    components: { ReportTemplate },
    data: () => ({
        title: 'PEPFAR Diseggregated Report',
        rows: [] as Array<any>,
        reportReady: false as boolean,
        isLoading: false as boolean,
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
        this.fields = this.getDateDurationFields()
    },
    methods: {
        async onPeriod(_: any, config: any) {
            this.rows = []
            this.report = new DisaggregatedReportService()
            this.report.setQuarter('pepfar')
            this.report.setStartDate(config.start_date)
            this.report.setEndDate(config.end_date)
            this.period = this.report.getDateIntervalPeriod()
            const isInit = await this.report.init()
            if (!isInit) {
                return toastWarning('Unable to initialise report')
            }
            await this.setTableRows()
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
                this.drill(this.totalNewM),
                this.drill(this.totalCurM),
                this.drill(this.totalIptM),
                this.drill(this.totalTbM)
            ])
        },
        setFemaleNotPregnantRows() {
            const row = [ 
                this.totalNewF, 
                this.totalCurF, 
                this.totalIptF,
                this.totalTbF
            ].map((data: any) => this.drill(data.filter((i: any) => !this.pregnantF.includes(i))))
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
                return [table.td('All'), table.td('FP'), this.drill(txNew), this.drill(txCur), this.drill(txIpt), this.drill(txTb)]
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
                return [table.td('All'), table.td('FBf'), this.drill(txNew), this.drill(txCur), this.drill(txIpt), this.drill(txTb)]
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
        }
    }
})
</script>
