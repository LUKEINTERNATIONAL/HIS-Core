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
import { StockService } from "./stock_service";
import { toastDanger, toastSuccess } from "@/utils/Alerts";
import { getFacilities } from "@/utils/HisFormHelpers/LocationFieldOptions";

export default defineComponent({
  components: { HisStandardForm },
  data: () => ({
    activeField: "",
    fields: [] as any,
    drugs: [] as any,
    selectedDrugs: [] as any,
    barcode: "",
    stockService: {} as any,
  }),

  methods: {
    async onFinish(formData: any) {
      const data = formData.enter_batches;
      const errors = [];
      for (let index = 0; index < data.length; index++) {
        const d = data[index].value;
        const packSize = StockService.getPackSize(d.drug_id);
        const total = packSize * d.tins;
        const extras = {} as any;
        const res = {
          'reallocation_code': d.authorization,
          quantity: total,
          reason: formData.reasons.value,
        };
        if (formData.task.value === "Relocations") {
          extras["location_id"] = formData.relocation_location.value;
          const f = await this.stockService.relocateItems(d.pharmacy_batch_id, {
            ...res,
            ...extras,
          });
          if (!f) {
            errors.push(
              "Could not save record for" + StockService.getShortName(d.drug_id)
            );
          }
        } else {
          const f = await this.stockService.disposeItems(d.pharmacy_batch_id, {
            ...res,
            ...extras,
          });
          if (!f) {
            errors.push(
              "Could not save record for" + StockService.getShortName(d.drug_id)
            );
          }
        }
      }
      if (errors.length === 0) {
        toastSuccess("Stock succesfully moved");
        this.$router.push("/");
      } else {
        toastDanger(`${errors.length} items could not be moved`);
      }
    },
    getFields(): Array<Field> {
      return [
        {
          id: "task",
          helpText: "Select task",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => [
            {
              label: "Relocations",
              value: "Relocations",
            },
            {
              label: "Disposal",
              value: "Disposal",
            },
          ],
        },
        {
          id: "relocation_location",
          helpText: "Destination",
          type: FieldType.TT_SELECT,
          validation: (val: Option) => Validation.required(val),
          condition: (val: any) => val.task.value === "Relocations",
          options: (_: any, filter = "") => getFacilities(filter),
          computedValue: (val: Option) => val.label,
          config: {
            showKeyboard: true,
            isFilterDataViaApi: true,
          },
        },
        {
          id: "date",
          helpText: "Set date",
          type: FieldType.TT_FULL_DATE,
          validation: (val: any) => Validation.required(val),
        },
        {
          id: "select drugs",
          helpText: "Select drugs",
          type: FieldType.TT_MULTIPLE_SELECT,
          requireNext: true,
          validation: (val: any) => Validation.required(val),
          options: () => this.getItems(),
          unload: (val: any) => (this.selectedDrugs = val),
        },
        {
          id: "enter_batches",
          helpText: "Batch entry",
          type: FieldType.TT_BATCH_MOVEMENT,
          options: () => this.selectedDrugs,
          validation: (val: any) => Validation.required(val),
        },
        {
          id: "reasons",
          helpText: "Select reason",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: (formdata: any) => this.getReasons(formdata),
        },
        {
          id: "summary",
          helpText: "Summary",
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
        "Authorization code",
      ];
      const rows = drugs.map((j: any) => {
        const d = j.value;
        return [
          StockService.getShortName(d.drug_id),
          d.tins,
          HisDate.toStandardHisDisplayFormat(d.expiry),
          d.authorization,
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
          'items': [
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
    async getItems() {
      const f = await this.stockService.getItems();
      return this.formatDrugs(f);
    },
    mapVal(vals: string[]) {
      return vals.map((data) => {
        return { label: data, value: data };
      });
    },
    getReasons(formdata: any): any {
      if (formdata.task.value === "Relocations") {
        return this.mapVal([
          "Transfer to another facility/relocation",
          "For trainings",
        ]);
      } else {
        return this.mapVal(["Expired", "Damaged", "For trainings"]);
      }
    },
    formatDrugs(f: any) {
      return f.map((drug: any) => {
        return {
          label: `${StockService.getShortName(
            drug.drug_id
          )} (${StockService.getPackSize(
            drug.drug_id
          )}) Expiry date: ${HisDate.toStandardHisDisplayFormat(
            drug.expiry_date
          )}`,
          value: drug,
        };
      });
    },
  },
  created() {
    this.stockService = new StockService();
    this.fields = this.getFields();
  },
});
</script>