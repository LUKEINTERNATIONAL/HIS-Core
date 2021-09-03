<template>
    <his-standard-form 
        :skipSummary="true" 
        :fields="fields" 
        @onFinish="onSubmit"
    />
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Field } from "@/components/Forms/FieldInterface"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { DisaggregatedReportService, AGE_GROUPS } from "@/apps/ART/services/reports/pepfar/disaggregated_service"
import { toastWarning } from '@/utils/Alerts'
import { isEmpty } from "lodash"

export default defineComponent({
    mixins: [ReportMixin],
    data: () => ({
        ageGroupCohort: {} as any,
        totalFemale: [[], [], [], []] as Array<any>,
        totalMales: [[], [], [], []] as Array<any>,
        totalAbsolutePregnant: [] as Array<number>,
    }),
    async created() {
        this.fields = this.getFields()
    },
    methods: {
        async init(startDate: string, endDate: string) {
            this.report = new DisaggregatedReportService(startDate, endDate)
            return this.report.init()
        },
        getColumns() {
            return  [
                '#',
                'Age group',
                'Gender',
                'Tx new (new on ART)',
                'Tx curr (receiving ART)',
                'TX curr (received IPT)',
                'TX curr (screened for TB)'
            ]
        },
        async buildTableRows() {
            return [
                ...(await this.buildFemaleRows()),
                ...(await this.buildMaleRows()),
                this.buildAllMaleRow(),
                ...(await this.buildFemalePregnantRows()),
                this.buildFemaleNotPregnantRow(),
                ...(await this.buildBreastFeedingRows())
            ].map((r: any, i: number) => [
                i+1,
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
        setTotalFemale(index: number, data: Array<any>) {
            this.totalFemale[index] = [...this.totalFemale[index], ...data]
        },
        setTotalMale(index: number, data: Array<any>) {
            this.totalMales[index] = [...this.totalMales[index], ...data]
        },
        setTotalPregnant(data: any) {
            this.totalAbsolutePregnant = [...this.totalAbsolutePregnant, ...data]
        },
        buildAllMaleRow() {
            return ['All', 'Male', ...this.totalMales]
        },
        buildFemaleNotPregnantRow() {
            const row = this.totalFemale.map((females: any) => {
                return females.filter((f: number) => !this.totalAbsolutePregnant.includes(f))
            })
            return ['All', 'FNP', ...row]
        },
        buildFemaleRows() {
            return this.buildRows('F', AGE_GROUPS, 
            (group: string, txNew: any, txCur: any, txIpt: any, txTb: any) => {
                this.setTotalFemale(0, txNew)
                this.setTotalFemale(1, txCur)
                this.setTotalFemale(2, txIpt)
                this.setTotalFemale(3, txTb)
                return [group, 'Female', txNew, txCur, txIpt, txTb]
            })
        },
        buildMaleRows() {
            return this.buildRows('M', AGE_GROUPS, 
            (group: string, txNew: any, txCur: any, txIpt: any, txTb: any) => {
                this.setTotalMale(0, txNew)
                this.setTotalMale(1, txCur)
                this.setTotalMale(2, txIpt)
                this.setTotalMale(3, txTb)
                return [group, 'Male', txNew, txCur, txIpt, txTb]   
            })
        },
        buildFemalePregnantRows() {
            return this.buildRows('F', ['Pregnant'], 
                (_: string, txNew: any, txCur: any, txIpt: any, txTb: any) => {
                this.setTotalPregnant(txNew)
                this.setTotalPregnant(txCur)
                this.setTotalPregnant(txIpt)
                this.setTotalPregnant(txTb)
                return [ 'All', 'FP', txNew, txCur, txIpt, txTb]
            })
        },
        buildBreastFeedingRows() {
            return this.buildRows('F', ['Breastfeeding'], 
            (_: string, txNew: any, txCur: any, txIpt: any, txTb: any) => {
                return ['All', 'FBf', txNew, txCur, txIpt, txTb]
            })
        },
        async buildRows(category: string, ageGroups: Array<string>, onFormat: Function) {
            const rows = []
            this.report.setGender(category === 'M' ? 'Male' : 'Female')
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
        },
        getFields(): Array<Field> {
            return [
                ...this.getDateDurationFields(),
                {
                    id: 'report',
                    helpText: 'ART disaggregated report',
                    type: FieldType.TT_TABLE_VIEWER,
                    options: async (_: any, c: any) => {
                       const isInit = await this.init(c.start_date, c.end_date)
                       if (!isInit) {
                           toastWarning('Unable to initialise report')
                           return []
                       }
                       const rows = await this.buildTableRows()
                       const columns = this.getColumns()
                       return [{
                           label: '', 
                           value: '',
                           other: {
                                rows, 
                                columns
                           }
                       }]
                    },
                    config: {
                        footerBtns: [
                            {
                                name: 'Rebuild Outcomes',
                                size: 'large',
                                slot: 'start',
                                color: 'success',
                                visibleOnStateChange: (state: any) => {
                                    return state.field.id === 'report'
                                }
                            }
                        ],
                        hiddenFooterBtns: [
                            'Cancel',
                            'Clear',
                            'Back'
                        ],
                        styles: ['his-table', 'table-borders']
                    }
                }
            ]
        }
    }
})
</script>
