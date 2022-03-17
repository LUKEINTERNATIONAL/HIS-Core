<template>
  <his-standard-form :fields="fields" @onSubmit="onSubmit" @onFinish="onFinish" :skipSummary="true" v-if="fields.length > 0"/>
</template> 
<script lang="ts">
import { defineComponent } from "vue";
import { FieldType } from "@/components/Forms/BaseFormElements"
import { GlobalPropertyService } from "@/services/global_property_service"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { Patientservice } from "@/services/patient_service"
import { toastWarning, toastSuccess } from "@/utils/Alerts"
import { Field } from "@/components/Forms/FieldInterface";
import Validation from "@/components/Forms/validations/StandardValidations"
export default defineComponent({
  components: { HisStandardForm },
  methods: {
    onFinish(formData: any) {
      GlobalPropertyService.set(this.property , formData.preference.value)
      .then(() => toastSuccess('Property set'))
      .then(() => this.$router.push('/'))
    },
    async getFields  (){

      
      this.fields =  [
        {
          id: "preference",
          helpText: this.label,
          type: FieldType.TT_YES_NO,
          preset: this.val,
          config: {
            showKeyboard: false,
            showSummary: false
          },
          validation: (val: any) => Validation.required(val),
          options: ()=>([
            {
              label: this.label,
              property: this.property,
              values: [
                {
                  label: "yes",
                  value: "true"
                },
                {
                  label: "no",
                  value: "false"
                }
                ],
            },
          ]),
        }
      ]

    }
  },
  data() {
    return {
      property: null as any,
      fields: [] as any,
      label: null as any,
      val : ''
    };
  },
  watch: {
    $route: {
      async handler({ query }: any) {
        if(query.label && query.property) {
          this.val = await GlobalPropertyService.get(query.property);
          this.property = query.property;
          this.label = query.label;
          this.getFields();
        }
      },
      deep: true,
      immediate: true,
    },
  },
});
</script>
