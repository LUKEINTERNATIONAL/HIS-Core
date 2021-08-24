<template>
  <his-standard-form
    :fields="fields"
    @onFinish="onFinish"
    :skipSummary="true"
  />
</template> 
<script lang="ts">
import { defineComponent } from "vue";
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations";
import {
  CHARACTERS_AND_NUMBERS_LO, DEFAULT_KEYPAD
} from "@/components/Keyboard/KbLayouts";
import ApiClient from "@/services/api_client";
import { infoActionSheet } from "@/utils/ActionSheets";
export default defineComponent({
  components: { HisStandardForm },
  methods: {
    onFinish(formData: any) {
      const ipAddress = formData.ip_address.value;
      const port = formData.port.value;
      ApiClient.setLocalStorage(ipAddress, port);
      this.$router.back();
    },
    getFields() {
      this.fields = [
        {
          id: "ip_address",
          helpText: "Enter IP Address",
          type: FieldType.TT_TEXT,
          validation: (val: any) => Validation.required(val) || Validation.isIPAddress(val),
          config: {
            customKeyboard: [
              CHARACTERS_AND_NUMBERS_LO,
              [[ "Delete"]],
            ],
          },
        },
        {
          id: "port",
          helpText: "Enter Port",
          validation: (val: any) => Validation.required(val),
          type: FieldType.TT_TEXT,
          config: {
            customKeyboard: [
              DEFAULT_KEYPAD,
              [],
            ],
          },
        },
      ];
    },
    async showConfigNotice() {
      if (this.isUsingLocalStorage()) {
        const action = await infoActionSheet(
          "Config notice",
          `The system is currently using user specified configurations. \
                Do you wish to reset back to server configurations?`,
          "",
          [
            { name: "Reset configurations", slot: "start", color: "success" },
            { name: "New configurations", slot: "end" },
          ]
        );

        if (action === "Reset configurations") {
          this.clearLocalStorage();
          this.$router.back();
        }
      }
    },
    isUsingLocalStorage() {
      if (localStorage.getItem("useLocalStorage") === "true") return true;
      return false;
    },
    clearLocalStorage() {
      const excluions = ['useLocalStorage',
        'apiURL',
        'apiPort',
        'apiProtocol'];
      ApiClient.removeOnly(excluions);
    },
  },
  data() {
    return {
      fields: [] as any,
    };
  },
  async mounted() {
    await this.showConfigNotice();
    this.getFields();
  },
});
</script>
