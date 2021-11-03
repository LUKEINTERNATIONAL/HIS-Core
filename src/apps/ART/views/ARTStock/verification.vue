<template>
  <his-standard-form
    :fields="fields"
    :activeField="activeField"
    :onFinishAction="onFinish"
    :skipSummary="true"
    :cancelDestinationPath="cancelDestination"
  >
  </his-standard-form>
</template> 
<script lang="ts">
import { defineComponent } from "vue";
import { Field, Option } from "@/components/Forms/FieldInterface";
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations";
import HisDate from "@/utils/Date";
import  { StockService } from "./stock_service";
import { Service } from "@/services/service";
import { toastDanger, toastSuccess } from "@/utils/Alerts";

export default defineComponent({
  components: { HisStandardForm },
  data: () => ({
    activeField: "",
    fields: [] as any,
    drugs: [] as any,
    selectedDrugs: [] as any,
    barcode: "",
    stockService: {} as any
  }),

  methods: {
    async onFinish(formData: any) {
      const items = formData.enter_batches;
      const errors = [];
      for (let index = 0; index < items.length; index++) {
        const element = items[index].value;
        const vals = {
                "current_quantity": element['current_quantity'],
                "reason": formData.reason.value
            };
            const f = await this.stockService.updateItem(element['pharmacy_batch_id'], vals)
            if(!f) {
              errors.push('could not stock for ' + items[index].shortName);
            }
      }
      if (errors.length === 0) {
        toastSuccess("Stock succesfully updated");
        this.$router.push("/");
      } else {
        toastDanger("Could not save stock");
      }
    },
    getFields(): Array<Field> {
      return [
        {
          id: "date",
          helpText: "Verfication Date",
          type: FieldType.TT_FULL_DATE,
          validation: (val: Option) => Validation.required(val),
        },
        {
          id: "enter_batches",
          helpText: "Batch entry",
          type: FieldType.TT_BATCH_VERIFICATION,
          options: () => this.drugs,
          validation: (val: Option) => Validation.required(val),
        },
        {
          id: "reason",
          helpText: "Select reason",
          type: FieldType.TT_SELECT,
          validation: (val: Option) => Validation.required(val),
          options: () => [
            {
              label: "Monthly stock take",
              value: "Monthly stock take",
            },
            {
              label: "Audit",
              value: "Audit",
            },
            {
              label: "Adhoc (due to stock imbalance)",
              value: "Adhoc (due to stock imbalance)",
            },
            {
              label: "Supervision",
              value: "Supervision",
            },
          ],
        },
        {
          id: "adherence_report",
          helpText: "ART adherence",
          type: FieldType.TT_TABLE_VIEWER,
          options: (d: any) => this.buildResults(d.enter_batches),
          config: {
            hiddenFooterBtns: ["Clear"],
          },
        },
      ];
    },
    buildResults(drugs: any) {
      const columns = [
        "Drug",
        "Total units",
        "Expiry date",
      ];
      const rows = drugs.map((j: any) => {
        const d = j.value;
        return [
          d.shortName,
          d['current_quantity'],
          HisDate.toStandardHisDisplayFormat(d.expiry_date),
        ];
      });
      return [
        {
          label: "Confirm entry",
          value: "Table",
          other: { columns, rows },
        },
      ];
    },
    prepDrugs(formdata: any) {
      const items: any[] = [];
      const barcode = this.barcode;
      
      formdata.enter_batches.value.forEach((element: any) => {
        items.push({
          'batch_number': element.batchNumber,
          items: [
            {
              'barcode': barcode,
              'drug_id': element.drugID,
              'expiry_date': element.expiry,
              'quantity': parseInt(element.tabs) * parseInt(element.tins),
              'delivery_date': formdata.date.value,
            },
          ],
        });
      });
      return items;
    },
    selectAll(listData: Array<Option>) {
      return listData.map((l) => {
        l.isChecked = true;
        return l;
      });
    },
    formatDrugs() {
      return this.stockService.drugList().map((drug: any) => {
        return {
          label: drug.shortName,
          value: drug,
        };
      });
    },
  },
  created() {
    this.stockService = new StockService();
    this.fields = this.getFields();
    this.drugs = this.formatDrugs();
  },
});
</script>