<template>
  <his-standard-form 
    :fields="fields" 
    :onFinishAction="onFinish" 
    :skipSummary="true"
  />
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { FieldType } from "@/components/Forms/BaseFormElements"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { Patientservice } from "@/services/patient_service"
import { toastWarning } from "@/utils/Alerts"
import { AppInterface } from "@/apps/interfaces/AppInterface";
import { Field, Option } from "@/components/Forms/FieldInterface"
import Validation from "@/components/Forms/validations/StandardValidations"
import HisApp from "@/apps/app_lib"
import { isEmpty } from "lodash"

export default defineComponent({
  components: { HisStandardForm },
  data: () => ({
    app: {} as AppInterface,
    fields: [] as Field[]
  }),
  created() {
    this.setApp()
    this.fields = [
      this.getIdSelectionField(),
      this.getIdSearchField()
    ]
  },
  methods: {
    getIdSelectionField(): Field {
      return {
        id: "identifier_type",
        helpText: "Select identifier type",
        type: FieldType.TT_SELECT,
        requireNext: false,
        validation: (val: Option) => Validation.required(val),
        options: () => {
          const ids = this.app.programPatientIdentifiers
            ? Object.values(this.app.programPatientIdentifiers) 
            : []
          return ids
            .filter(i => i.useForSearch) 
            .map(identifier => ({
              label: identifier.name,
              value: identifier.id,
              other: identifier
          }))
        }
      }
    },
    getIdSearchField(): Field {
      return {
        id: "identifier",
        helpText: "Identifier",
        dynamicHelpText: (f: any) => `Search by ${f.identifier_type.label}`,
        type: FieldType.TT_TEXT,
        validation: (val: Option) => Validation.required(val),
        config: {
          initialKb: '0-9',
          prependValue: (f: any) => {
            return f.identifier_type.other.prefix()
          }
        }
      }
    },
    setApp() {
      const app = HisApp.getActiveApp()
      if (app) this.app = app
    },
    async onFinish(formData: any) {
      const idType = formData.identifier_type.value
      const identifier = formData.identifier.value
      const res = await Patientservice
        .findByOtherID(
          idType, identifier
        )
      if (!isEmpty(res)) {
        const patient = new Patientservice(res[0])
        this.$router.push(`/patients/confirm?person_id=${patient.getID()}`);
      } else {
        toastWarning('Client not found')
      }
    }
  }
});
</script>
