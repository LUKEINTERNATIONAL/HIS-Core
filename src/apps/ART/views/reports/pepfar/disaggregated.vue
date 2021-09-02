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
        ageGroupTotals: {} as any
    }),
    async created() {
        this.fields = this.getFields()
    },
    methods: {
        async init(startDate: string, endDate: string) {
            this.ageGroupCohort = {}
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
            const femaleAgeGroups: Array<any> = await this.buildAgeGroupRows('F')
            const maleAgeGroups: Array<any> = await this.buildAgeGroupRows('M')
            const allMale: Array<any> = this.ageGroupTotals['M'].map((g: any) => this.buildDrillableLink(g))
            const rows = [
                ...femaleAgeGroups, 
                ...maleAgeGroups,
                ['All', 'Male', ...allMale]
            ]
            return rows.map((d: any, i: number) => {
                d.unshift(i + 1)
                return d
            })
        },
        async getValue(prop: string, gender: string, data: any) {
            let res: any = {}
            switch(prop) {
                case 'tx_given_ipt':
                    res = await this.report.getTxIpt()
                    break;
                case 'tx_screened_for_tb':
                    res = await this.report.getTxCurrTB()
                    break;
                default:
                    res = gender in data ? data[gender][prop] : []
            }
            return { link: this.buildDrillableLink(res), data: res }
        },
        async buildAgeGroupRows(gender: 'F' | 'M') {
            const rows = []
            const genderProps: any = { F: 'Female', M: 'Male'}
            const strGender = genderProps[gender]
            this.report.setGender(strGender.toLowerCase())

            if (!(gender in this.ageGroupTotals)) {
                this.ageGroupTotals[gender] = [[], [], [], []]
            }

            for (const i in AGE_GROUPS) {
                let row: any = [0, 0, 0, 0]
                const ageGroup: any = AGE_GROUPS[i]
                this.report.setAgeGroup(ageGroup)

                if (!(ageGroup in this.ageGroupCohort)) {
                    const req = await this.report.getCohort()
                    this.ageGroupCohort[ageGroup] = !isEmpty(req) ? req[ageGroup] : {}
                }
                if (!isEmpty(this.ageGroupCohort[ageGroup])) {
                    const value = async (prop: string, i: number) => {
                        const val = await this.getValue(prop, gender, this.ageGroupCohort[ageGroup])   
                        this.ageGroupTotals[gender][i] = [
                            ...this.ageGroupTotals[gender][i], ...val.data
                        ]
                        return val
                    }
                    row = [
                        (await value('tx_new', 0)).link,
                        (await value('tx_curr', 1)).link,
                        (await value('tx_given_ipt', 2)).link,
                        (await value('tx_screened_for_tb', 3)).link
                    ]
                }
                rows.push([ ageGroup, strGender, ...row ])
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
                       const columns = this.getColumns()
                       const rows = await this.buildTableRows()
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
                            'Clear'
                        ],
                        styles: ['his-table', 'table-borders']
                    }
                }
            ]
        }
    }
})
</script>
