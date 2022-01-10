<script lang="ts">
import { Service } from "@/services/service"
import { defineComponent } from 'vue'
import { Field } from '@/components/Forms/FieldInterface'
import { generateDateFields } from "@/utils/HisFormHelpers/MultiFieldDateHelper"
import { Patientservice } from "@/services/patient_service"
import HisDate from "@/utils/Date"
import { modalController } from "@ionic/vue";
import DrilldownTable from "@/apps/ART/views/reports/BasicReportTemplate.vue"
import { ArtReportService } from "@/apps/ART/services/reports/art_report_service"
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Option } from '@/components/Forms/FieldInterface'
import Validation from "@/components/Forms/validations/StandardValidations"
import table from "@/components/DataViews/tables/ReportDataTable"

export default defineComponent({
    data: () => ({
        fields: [] as Array<Field>,
        report: {} as any,
        reportReady: false as boolean,
        period: '' as string,
        startDate: '' as string,
        endDate: '' as string,
        drillDownCache: {} as Record<number, Array<any>>
    }),
    methods: {
        toDate(date: string) {
            return HisDate.toStandardHisDisplayFormat(date)
        },
        confirmPatient(patient: number) {
            return this.$router.push(`/patients/confirm?person_id=${patient}`)
        },
        async drilldownAsyncRows(title: string, columns: Array<any>, asyncRows: Function) {
            const modal = await modalController.create({
                component: DrilldownTable,
                cssClass: 'large-modal',
                componentProps: { 
                    title, 
                    columns, 
                    asyncRows,
                    paginated: true,
                    showReportStamp: false,
                    footerColor: 'light',
                    onFinish: () => modalController.dismiss()
                }
            })
            modal.present()
        },
        async drilldownData(title: string, columns: Array<any>, rows: Array<any>, rowParser: any) {
            const modal = await modalController.create({
                component: DrilldownTable,
                cssClass: 'large-modal',
                componentProps: { 
                    title, 
                    columns, 
                    rows,
                    rowParser,
                    paginated: true,
                    showReportStamp: false,
                    footerColor: 'light',
                    onFinish: () => modalController.dismiss()
                }
            })
            modal.present()
        },
        getDefaultDrillDownTable() {
            const columns = [
                [
                    table.thTxt('ARV number'), 
                    table.thTxt('Gender'),
                    table.thTxt('Birth Date'), 
                    table.thTxt('Actions')
                ]
            ]
            const rowParser = (tableRows: Array<any[]>) => {
                return tableRows.map(async (defaultRow: Array<any>) => {
                    const [index, id ] = defaultRow
                    if (id in this.drillDownCache) {
                        const [oldIndex, ...rest] = this.drillDownCache[id]
                        return [index, ...rest] // Assign new index number and maintain patient record
                    } 
    
                    const data = await Patientservice.findByID(id)
                    const patient = new Patientservice(data)
                    const row = [
                        index,
                        table.td(patient.getArvNumber()), 
                        table.td(patient.getGender()), 
                        table.tdDate(patient.getBirthdate().toString()),
                        table.tdBtn('Show', async () => {
                            await modalController.dismiss({})
                            this.$router.push({ path: `/patient/dashboard/${id}`})
                        })
                    ]
                    this.drillDownCache[id] = row
                    return row
                })
            }
            return { rowParser, columns }
        },
        runTableDrill(data: any, title='Drilldown patients') {
            const { columns, rowParser } = this.getDefaultDrillDownTable()
            this.drilldownData(title, columns, data, rowParser)
        },
        drill(values: Array<number>, title='Drill table') {
            if (values.length > 0) {
                return table.tdLink(
                    values.length, 
                    () => this.runTableDrill(values, title)
                )
            }
            return table.td(values.length)
        },
        getQuaterOptions() {
            const quarters = ArtReportService.getReportQuarters()
            return quarters.map((q: any) => ({
                label: q.name, value: q.start, other: q
            }))
        },
        getDateDurationFields(useQuarter=false, setCustomQuarterPeriod=false, maxQuarter=5): Array<Field> {
            const minDate = '2001-01-01'
            const maxDate = Service.getSessionDate()
            return [
                {
                    id: 'quarter',
                    helpText: 'Select Quarter',
                    type: FieldType.TT_SELECT,
                    condition: () => useQuarter,
                    validation: (val: Option) => Validation.required(val),
                    options: () => {
                        const quarters = ArtReportService.getReportQuarters(maxQuarter)
                        let items: Array<Option> = quarters.map((q: any) => ({
                            label: q.name,
                            value: q.start,
                            other: q
                        }))
                        if (setCustomQuarterPeriod) {
                            items = [
                                {
                                    label: 'Set custom period',
                                    value: 'custom_period',
                                    other: {}
                                },
                                ...items
                            ]
                        }
                        return items
                    }
                },
                ...generateDateFields({
                    id: 'start_date',
                    helpText: 'Start',
                    required: true,
                    condition: (f: any) => f.quarter && f.quarter.value === 'custom_period' || !useQuarter,
                    minDate: () => minDate,
                    maxDate: () => maxDate,
                    estimation: {
                        allowUnknown: false
                    },
                    computeValue: (date: string) => date 
                }),
                ...generateDateFields({
                    id: 'end_date',
                    helpText: 'End',
                    required: true,
                    condition: (f: any) => f.quarter && f.quarter.value === 'custom_period' || !useQuarter,
                    unload: (d: any, s: any, f: any, c: any) => {
                        if (s === 'next') {
                            this.endDate = c.end_date
                        }
                    },
                    minDate: (_: any, c: any) => c.start_date,
                    maxDate: () => maxDate,
                    estimation: {
                        allowUnknown: false
                    },
                    computeValue: (date: string) => date
                })
            ]
        }
    }
})
</script>
