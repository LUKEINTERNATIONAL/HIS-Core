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
import { RegimenReportService } from "@/apps/ART/services/reports/pepfar/regimen_report_service"
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"

export default defineComponent({
    mixins: [ReportMixin],
    async created() {
        this.fields = this.getFields()
    },
    methods: {
        async init(startDate: string, endDate: string) {
            this.report = new RegimenReportService(startDate, endDate)
        },
        getColumns() {
            return  ['ARV#','Patient type','Gender','DOB','Prev.Reg','Curr.Reg','ARVs', 'Curr.reg dispensed date']
        },
        async buildTableRows() {
            const rows = await this.report.getRegimenSwitchReport()
            return Object.values(rows).map((data: any) => {
                let lastDispenseDate = ''
                const medications = data.medication.map((m: any) => {
                    lastDispenseDate = this.toDate(m.start_date)
                    return `${m.medication} (${m.quantity})`
                })
                return [
                    data.arv_number,
                    data.patient_type,
                    data.gender,
                    this.toDate(data.birthdate),
                    data.previous_regimen,
                    data.current_regimen,
                    medications.join(', '),
                    lastDispenseDate
                ]
            })
        },
        getFields(): Array<Field> {
            return [
                ...this.getDateDurationFields(),
                {
                    id: 'report',
                    helpText: 'Switch Regimen Report',
                    type: FieldType.TT_TABLE_VIEWER,
                    options: async (_: any, c: any) => {
                       this.init(c.start_date, c.end_date)
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
