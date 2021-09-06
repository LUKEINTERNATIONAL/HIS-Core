<template>
    <report-template
        :title="title"
        :period="period"
        :totalClients="totalClients"
        > 
        <report-table :rows="rows" :columns="columns"> </report-table>
    </report-template>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { DisaggregatedReportService, AGE_GROUPS } from "@/apps/ART/services/reports/pepfar/disaggregated_service"
import { toastWarning } from '@/utils/Alerts'
import { isEmpty, uniq } from "lodash"

export default defineComponent({
    mixins: [ReportMixin],
    data: () => ({
        title: 'PEPFAR Diseggregated Report',
        rows: [] as Array<any>,
        columns: [
            'Age group',
            'Gender',
            'Tx new (new on ART)',
            'Tx curr (receiving ART)',
            'TX curr (received IPT)',
            'TX curr (screened for TB)'
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
    watch: {
        isReady: {
            async handler(y: boolean) {
                if (y) {
                    await this.init(this.startDate, this.endDate)
                }
            },
            immediate: true
        }
    },
    methods: {
        async init(startDate: string, endDate: string) {
            this.report = new DisaggregatedReportService(startDate, endDate)
            const isInit = this.report.init()
            if (!isInit) {
                return toastWarning('Unable to initialise report')
            }
            await this.setTableRows()
        },
        async setTableRows() {
            const female = await this.buildFemaleRows()
            const male = await this.buildMaleRows()
            const pregnant = await this.buildFemalePregnantRows()
            const breastFeeding = await this.buildBreastFeedingRows()
            const totalMale = this.buildAllMaleRow()
            const totalNotPregnant = this.buildFemaleNotPregnantRow()
            this.rows = [
                ...female,
                ...male,
                totalMale,
                ...pregnant,
                totalNotPregnant,
                ...breastFeeding,
 
            ].map((r: any) => [
                r[0],
                r[1],
                this.buildDrillableLink(r[2]), //Tx new
                this.buildDrillableLink(r[3]), //Tx curr
                this.buildDrillableLink(r[4]), //Tx ipt
                this.buildDrillableLink(r[5]) //Tx tb
            ])
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
        buildAllMaleRow() {
            return [
                'All', 
                'Male', 
                this.totalNewM,
                this.totalCurM,
                this.totalIptM,
                this.totalTbM
            ]
        },
        buildFemaleNotPregnantRow() {
            const row = [ 
                this.totalNewF, 
                this.totalCurF, 
                this.totalIptF,
                this.totalTbF
            ].map((data: any) => data.filter((i: any) => !this.pregnantF.includes(i)))
            return [ 'All', 'FNP', ...row ]
        },
        buildFemaleRows() {
            this.report.setGender('female')
            return this.buildRows('F', AGE_GROUPS, 
            (group: string, txNew: any, txCur: any, txIpt: any, txTb: any) => {
                this.totalNewF = uniq(this.totalNewF.concat(txNew))
                this.totalCurF = uniq(this.totalCurF.concat(txCur))
                this.totalIptF = uniq(this.totalIptF.concat(txIpt))
                this.totalTbF  = uniq(this.totalTbF.concat(txTb))
                return [ group, 'Female', txNew, txCur, txIpt, txTb ]
            })
        },
        buildMaleRows() {
            this.report.setGender('male')
            return this.buildRows('M', AGE_GROUPS, 
            (group: string, txNew: any, txCur: any, txIpt: any, txTb: any) => {
                this.totalNewM = uniq(this.totalNewM.concat(txNew))
                this.totalCurM = uniq(this.totalCurM.concat(txCur))
                this.totalIptM = uniq(this.totalIptM.concat(txIpt))
                this.totalTbM  = uniq(this.totalTbM.concat(txTb))
                return [ group, 'Male', txNew, txCur, txIpt, txTb ]   
            })
        },
        buildFemalePregnantRows() {
            this.report.setGender('pregnant')
            return this.buildRows('F', ['Pregnant'], 
                (_: string, txNew: any, txCur: any, txIpt: any, txTb: any) => {
                this.pregnantF = uniq(this.pregnantF.concat(txNew))
                this.pregnantF = uniq(this.pregnantF.concat(txCur))
                this.pregnantF = uniq(this.pregnantF.concat(txIpt))
                this.pregnantF = uniq(this.pregnantF.concat(txTb))
                return [ 'All', 'FP', txNew, txCur, txIpt, txTb]
            })
        },
        buildBreastFeedingRows() {
            this.report.setGender('breastfeeding')
            return this.buildRows('F', ['Breastfeeding'], 
            (_: string, txNew: any, txCur: any, txIpt: any, txTb: any) => {
                this.pregnantF = uniq(this.pregnantF.concat(txNew))
                this.pregnantF = uniq(this.pregnantF.concat(txCur))
                this.pregnantF = uniq(this.pregnantF.concat(txIpt))
                this.pregnantF = uniq(this.pregnantF.concat(txTb))
                return ['All', 'FBf', txNew, txCur, txIpt, txTb]
            })
        },
        async buildRows(category: string, ageGroups: Array<string>, onFormat: Function) {
            const rows = []
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
                rows.push(onFormat(group, txNew, txCurr, txGivenIpt, txScreenTB))
            }
            return rows
        }
    }
})
</script>
