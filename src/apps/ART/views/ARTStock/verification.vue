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
      const items = this.prepDrugs(formData);
      const f = await Service.postJson("/pharmacy/batches", items);
      if (f) {
        toastSuccess("Stock succesfully added");
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
        },
        {
          id: "enter_batches",
          helpText: "Batch entry",
          type: FieldType.TT_BATCH_VERIFICATION,
          options: () => this.drugs,
        },
        {
          id: "reason",
          helpText: "Select reason",
          type: FieldType.TT_SELECT,
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
          options: (d: any) => this.buildResults(d.enter_batches.value),
          config: {
            hiddenFooterBtns: ["Clear"],
          },
        },
      ];
    },
    buildResults(d: any) {
      const columns = [
        "Drug",
        "Total units",
        "Expiry date",
      ];
      const rows = d.map((d: any) => {
        return [
          d.shortName,
          d['current_quantity'],
          HisDate.toStandardHisDisplayFormat(d.expiry),
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