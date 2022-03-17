<template>
  <his-standard-form :fields="fields" @onFinish="onFinish" :skipSummary="true"/>
</template> 
<script lang="ts">
import { defineComponent } from "vue";
import { FieldType } from "@/components/Forms/BaseFormElements"
import { GlobalPropertyService } from "@/services/global_property_service"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { Patientservice } from "@/services/patient_service"
import { toastWarning } from "@/utils/Alerts"
export default defineComponent({
  components: { HisStandardForm },
  methods: {
    onFinish(formData: any) {
      const ARVNumber = this.fields[1].config.prependValue + formData.arv_number.value;
      this.fetchclient(ARVNumber);
    },
    getSitePrefix: async function() {
      const sitePrefix = await GlobalPropertyService.getSitePrefix()

      if (sitePrefix) this.fields[1].config.prependValue = `${sitePrefix}-ARV-`;
    },
    fetchclient: async function(arvNumber: string) {
      const data = await Patientservice.findByOtherID(4, arvNumber)

      if(data.length == 0) {
        toastWarning('Client not found')
      }else if (data.length == 1){
        // get all the patients identifiers, check if they have a national idd
        //if they have one go to to search page
        // if not assign one to them
        const identifiers  = data[0].patient_identifiers.filter((identifier: any) => {
          return identifier.type.name.match(/National ID|Old Identification/i);
        });
        if(identifiers.length == 0) {
          //assign national health ID here
          this.$router.push(`/patients/confirm?person_id=${data[0].patient_id}`);
        }else {
          this.$router.push(`/patients/confirm?person_id=${data[0].patient_id}`);
        }
        
      }
    }
  },
  data() {
    return {
      fields: [
        {
          id: "identifier_type",
          helpText: "Select identifier type",
          type: FieldType.TT_SELECT,
          config: {
            showKeyboard: false,
          },
          requireNext: false,
          validation(value: any): null | Array<string> {
            return !value ? ["Value is required"] : null;
          },
          options: ()=>([
            {
              label: "ARV Number",
              value: "ARV Number",
            },
          ]),
        },
        {
          id: "arv_number",
          helpText: "ARV Number",
          type: FieldType.TT_TEXT,
          validation(value: any): null | Array<string> {
            return !value ? ["Value is required"] : null;
          },
          config: {
            prepend: true,
            prependValue: "ARV"
          },
          disabled: true,
        },
      ],
    };
  },
  mounted() {
    this.getSitePrefix();
  }
});
</script>
