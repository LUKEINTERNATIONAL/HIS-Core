<template>
    <his-standard-form :skipSummary="true" :fields="fields" @onFinish="onSubmit"/>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import {DrugService} from "@/services/drug_service"
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Field } from "@/components/Forms/FieldInterface"
import Validation from "@/components/Forms/validations/StandardValidations"
import { PrintoutService} from "@/services/printout_service"

export default defineComponent({
    components: { HisStandardForm },
    data: () => ({
        fields: [] as Array<Field>    
    }),
    async created(){
        this.fields = [ 
            {
                id: 'drug',
                helpText: 'Select drug',
                type: FieldType.TT_SELECT,
                validation: (val: any) => Validation.required(val),
                options: async (_, filter='') => {
                    const facilities = await DrugService.getDrugs({name: filter})
                    return facilities.map((facility: any) => ({
                        label: facility.name,
                        value: facility.drug_id
                    }))
                },
                config: {
                    showKeyboard: true,
                    isFilterDataViaApi: true
                }
            },
            {
                id: 'quantity',
                helpText: 'Input quantity',
                type: FieldType.TT_NUMBER,
                validation: (val: any) => Validation.required(val),
                config: {
                    showKeyboard: true,
                }
            }
        ]
    },
    methods: {
        async onSubmit(form: any) {
            const label = new PrintoutService()
            try {
                await label.printDrug(form.drug.value, form.quantity.value)
                this.$router.push({path: '/'})
            }catch(e) { 
                console.log(e)
            }
        }
    }
})
</script>

