<template>
  <his-standard-form :fields="fields" @onSubmit="onSubmit" @onFinish="onFinish" :skipSummary="true" v-if="fields.length > 0"/>
</template> 
<script lang="ts">
import { defineComponent } from "vue";
import { FieldType } from "@/components/Forms/BaseFormElements"
import { GlobalPropertyService } from "@/services/global_property_service"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { toastSuccess } from "@/utils/Alerts"
import Validation from "@/components/Forms/validations/StandardValidations"
export default defineComponent({
  components: { HisStandardForm },
  methods: {
    onFinish(formData: any) {
      GlobalPropertyService.set(this.property , formData.preference)
      .then(() => toastSuccess('Property set'))
      .then(() => this.$router.push('/'))
    },
    async getFields  (){
      this.fields =  [
        {
          id: "preference",
          helpText: this.label,
          type: FieldType.TT_YES_NO,
          defaultValue: () => this.val,
          validation: (val: any) => Validation.required(val),
          options: ()=>([
            {
              label: this.label,
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
          try {
            this.val = await GlobalPropertyService.get(query.property);
          } catch (error) {
            console.log('fixed global property not found error');
          }
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
