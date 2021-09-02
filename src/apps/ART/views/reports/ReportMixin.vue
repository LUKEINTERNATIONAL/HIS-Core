<script lang="ts">
import { Service } from "@/services/service"
import { defineComponent } from 'vue'
import { Field } from '@/components/Forms/FieldInterface'
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { generateDateFields } from "@/utils/HisFormHelpers/MultiFieldDateHelper"
import { Patientservice } from "@/services/patient_service"
import HisDate from "@/utils/Date"

export default defineComponent({
    components: { HisStandardForm },
    data: () => ({
        fields: [] as Array<Field>,
        report: {} as any,
        startDate: '' as string,
        endDate: '' as string
    }),
    methods: {
        async patientTableColumns(ids: Array<number>) {
            const columns = ['ARV number', 'Gender', 'Birth Date']
            const rows = await Promise.all(ids.map(async(id: number) => {
                const data = await Patientservice.findByID(id)
                const patient = new Patientservice(data)
                return [
                    patient.getArvNumber(), 
                    patient.getGender(), 
                    HisDate.toStandardHisDisplayFormat(patient.getBirthdate())
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
                    const x = await this.patientTableColumns(values)
                    console.log(x)
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
