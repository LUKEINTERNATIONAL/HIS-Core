<script lang="ts">
import { Service } from "@/services/service"
import { defineComponent } from 'vue'
import { Field } from '@/components/Forms/FieldInterface'
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { generateDateFields } from "@/utils/HisFormHelpers/MultiFieldDateHelper"
import { Patientservice } from "@/services/patient_service"
import HisDate from "@/utils/Date"
import { modalController } from "@ionic/vue";
import BasicTable from "@/components/DataViews/HisBasicTable.vue"

export default defineComponent({
    components: { HisStandardForm },
    data: () => ({
        fields: [] as Array<Field>,
        report: {} as any,
        period: '' as string,
        startDate: '' as string,
        endDate: '' as string,
        isReady: false as boolean,
    }),
    watch: {
        '$route': {
            async handler({query}: any){
                if(query && query.start && query.end) {
                    this.startDate = query.start
                    this.endDate = query.end
                    this.period = `${this.toDate(this.startDate)}-${this.toDate(this.endDate)}`
                    this.isReady = true
                }
            },
            deep: true,
            immediate: true
        }
    },
    methods: {
        toDate(date: string) {
            return HisDate.toStandardHisDisplayFormat(date)
        },
        async tableDrill(tableData: any){
            const modal = await modalController.create({
                component: BasicTable,
                cssClass: 'custom-modal',
                componentProps: {
                    columns: tableData.columns,
                    rows: tableData.rows
                }
            })
            modal.present()
        },
        async patientTableColumns(ids: Array<number>) {
            const columns = ['ARV number', 'Gender', 'Birth Date', 'actions']
            const rows = await Promise.all(ids.map(async(id: number) => {
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
                rows,
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
