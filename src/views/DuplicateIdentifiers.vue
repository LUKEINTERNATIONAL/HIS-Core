<template>
    <report-template
        :title="title"
        :period="period"
        :rows="rows" 
        :fields="fields"
        :columns="columns"
        :canExportCsv="false"
        :canExportPDf="false"
        :onReportConfiguration="onPeriod"
        > 
    </report-template>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue"
import { FieldType } from '@/components/Forms/BaseFormElements'
import { Field } from '@/components/Forms/FieldInterface'
import { Option } from '@/components/Forms/FieldInterface'
import table, { RowInterface } from "@/components/DataViews/tables/ReportDataTable"
import { IdentifierService, DuplicateIdentifiersInterface } from "@/services/identifier_service"
import Validation from "@/components/Forms/validations/StandardValidations"
import DrillTable from "@/components/DataViews/DrillTableModal.vue"
import { modalController } from "@ionic/vue";
import { Patientservice } from "@/services/patient_service"

export default defineComponent({
    components: { ReportTemplate },
    data: () => ({
        title: 'Duplicate Identifiers',
        fields: [] as Field[],
        rows: [] as Array<RowInterface[]>,
        columns: [
            [
                table.thTxt('identifier'), 
                table.thTxt('Count'), 
                table.thTxt('Action')
            ]
        ]
    }),
    created() {
        this.fields = this.getFormFields()
    },
    methods: {
        async onPeriod({identifier}: any) {
            this.title = identifier.label + 'Duplicates'
            this.rows = await this.getRows(parseInt(identifier.value.toString()))
        },
        getFormFields(): Array<Field> {
            return [
                {
                    id: 'identifier',
                    helpText: 'Select Identifier type',
                    type: FieldType.TT_SELECT,
                    validation: (val: Option) => Validation.required(val),
                    options: async () => 
                        (await IdentifierService.getIdentifierTypes())
                            .map((i: any) => ({
                                label: i.name,
                                value: i.patient_identifier_type_id
                            }))
                }
            ]
        },
        async drillDuplicates(identifier: string){
            const modal = await modalController.create({
                component: DrillTable,
                cssClass: 'custom-modal',
                componentProps: {
                    title: 'DrillTable',
                    columns: [
                        'Given name', 'Family name', 'Gender', 'Birth date', 'Action'
                    ],
                    onRows: async () => {
                        const patients = await Patientservice.findByNpid(identifier)
                        return patients.map((p: any) => {
                            const patient = new Patientservice(p)
                            return [
                                patient.getGivenName(),
                                patient.getFamilyName(),
                                patient.getGender(),
                                patient.getBirthdate(),
                                {
                                    type: 'button',
                                    name: 'View',
                                    action: () => {
                                        this.$router.push(`/patient/dashboard/${patient.getID()}`)
                                    }
                                }
                            ]
                        })
                    } 
                }
            })
            modal.present()
        },
        async getRows(idType: number) {
            return (await IdentifierService.getDuplicateIndentifiers(idType))
                .map((i: DuplicateIdentifiersInterface) => ([
                    table.td(i.identifier),
                    table.td(i.count),
                    table.tdBtn('Select', () => this.drillDuplicates(i.identifier))
                ]))
        }
    }
})
</script>
