<script lang="ts">
import { Service } from "@/services/service"
import { defineComponent } from 'vue'
import { Field } from '@/components/Forms/FieldInterface'
import { generateDateFields } from "@/utils/HisFormHelpers/MultiFieldDateHelper"
import { Patientservice } from "@/services/patient_service"
import HisDate from "@/utils/Date"
import { modalController } from "@ionic/vue";
import DrillTable from "@/components/DataViews/DrillTableModal.vue"
import BasicTable from "@/components/DataViews/HisBasicTable.vue"
import { ArtReportService } from "@/apps/ART/services/reports/art_report_service"

export default defineComponent({
    data: () => ({
        fields: [] as Array<Field>,
        report: {} as any,
        reportReady: false as boolean,
        period: '' as string,
        startDate: '' as string,
        endDate: '' as string,
    }),
    methods: {
        toDate(date: string) {
            return HisDate.toStandardHisDisplayFormat(date)
        },
        async tableDrill(tableData: any){
            const modal = await modalController.create({
                component: DrillTable,
                cssClass: 'custom-modal',
                componentProps: {
                    title: 'DrillTable',
                    columns: tableData.columns,
                    onRows: tableData.onRows
                }
            })
            modal.present()
        },
        async patientTableColumns(ids: Array<number>) {
            const columns = ['ARV number', 'Gender', 'Birth Date', 'actions']
            const onRows = () => Promise.all(ids.map(async(id: number) => {
                const data = await Patientservice.findByID(id)
                const patient = new Patientservice(data)
                return [
                    patient.getArvNumber(), 
                    patient.getGender(), 
                    HisDate.toStandardHisDisplayFormat(patient.getBirthdate()),
                    {
                        type: 'button',
                        name: 'Show',
                        action: async () => {
                            await modalController.dismiss({})
                            this.$router.push({ path: `/patient/dashboard/${id}`})
                        }
                    }
                ]
            }))
            return {
                onRows,
                columns
            }
        },
        buildDrillableLink(values: Array<number>) {
            return {
                type: 'link',
                value: values.length,
                isActive: values.length > 0,
                action: async () => {
                    const tableData = await this.patientTableColumns(values)
                    await this.tableDrill(tableData)
                }
            }
        },
        getQuaterOptions() {
            const quarters = ArtReportService.getReportQuarters()
            return quarters.map((q: any) => ({
                label: q.name, value: q.start, other: q
            }))
        },
        getDateDurationFields(minDate='2001-01-01', maxDate=Service.getSessionDate()): Array<Field> {
            return [
                ...generateDateFields({
                    id: 'start_date',
                    helpText: 'Start',
                    required: true,
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
                    unload: (d: any, s: any, f: any, c: any) => {
                        if (s === 'next') {
                            this.endDate = c.end_date
                        }
                    },
                    minDate: () => this.startDate,
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
