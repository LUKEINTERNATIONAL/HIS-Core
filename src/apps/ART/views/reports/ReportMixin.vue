<script lang="ts">
import { Service } from "@/services/service"
import { defineComponent } from 'vue'
import { Field } from '@/components/Forms/FieldInterface'
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { generateDateFields } from "@/utils/HisFormHelpers/MultiFieldDateHelper"

export default defineComponent({
    components: { HisStandardForm },
    data: () => ({
        fields: [] as Array<Field>,
        startDate: '' as string,
        endDate: '' as string
    }),
    methods: {
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
                    computeValue: (date: string) => this.startDate = date 
                }),
                ...generateDateFields({
                    id: 'end_date',
                    helpText: 'End',
                    required: true,
                    minDate: () => this.startDate,
                    maxDate: () => maxDate,
                    estimation: {
                        allowUnknown: false
                    },
                    computeValue: (date: string) => this.endDate = date
                })
            ]
        }
    }
})
</script>
