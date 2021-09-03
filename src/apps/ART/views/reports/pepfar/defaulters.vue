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
import { DefaulterReportService } from "@/apps/ART/services/reports/pepfar/defaulters_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"

export default defineComponent({
    mixins: [ReportMixin],
    async created() {
        this.fields = this.getFields()
    },
    methods: {
        async init(startDate: string, endDate: string) {
            this.report = new DefaulterReportService(startDate, endDate)
        },
        getColumns() {
            return  [
                'ARV#',
                'First name',
                'Last name',
                'Gender',
                'birthdate',
                'Date defaulted',
                'Address'
            ]
        },
        async buildTableRows() {
            const rows = await this.report.getDefaulters()
            return rows.map((data: any) => ([
                data.arv_number,
                data.given_name,
                data.family_name,
                data.gender,
                this.toDate(data.birthdate),
                this.toDate(data.defaulter_date),
                `${data.village} ${data.district} ${data.ta}`
            ]))
        },
        getFields(): Array<Field> {
            return [
                ...this.getDateDurationFields(),
                {
                    id: 'report',
                    helpText: 'Defaulters List',
                    type: FieldType.TT_TABLE_VIEWER,
                    options: async (_: any, c: any) => {
                       await this.init(c.start_date, c.end_date)
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
