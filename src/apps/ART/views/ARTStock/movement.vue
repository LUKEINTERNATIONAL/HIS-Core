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
import { finalList } from "./stock_service";
import { StockService } from "../../services/stock_service";
import { Service } from "@/services/service";
import { toastDanger, toastSuccess } from "@/utils/Alerts";
import {getFacilities} from "@/utils/HisFormHelpers/LocationFieldOptions"

export default defineComponent({
  components: { HisStandardForm },
  data: () => ({
    activeField: "",
    fields: [] as any,
    drugs: [] as any,
    selectedDrugs: [] as any,
    barcode: ''
  }),

  methods: {
    async onFinish(formData: any) {
      const items = this.prepDrugs(formData);
      const f = await Service.postJson('/pharmacy/batches', items);
      if(f) {
        toastSuccess('Stock succesfully added');
        this.$router.push('/')
      }else {
        toastDanger('Could not save stock');
      }
    },
    getFields(): Array<Field> {
      return [
          {
          id: "task",
          helpText: "Select task",
          type: FieldType.TT_SELECT,
          options: () => [
            {
              label: "Relocations",
              value: "Relocations",
            },
            {
              label: "Disposal",
              value: "Disposal",
            }
          ],
        },
        {
                id: 'relocation_location',
                helpText: 'Destination',
                type: FieldType.TT_SELECT,
                defaultValue: () => Service.getLocationName(),
                validation: (val: Option) => Validation.required(val),
                condition: (val: any) => val.task.value === 'Relocations',
                options: (_: any, filter='') => getFacilities(filter),
                computedValue: (val: Option) => val.label,
                config: {
                    showKeyboard: true,
                    isFilterDataViaApi: true
                }
        },
        {
          id: "date",
          helpText: "Set date",
          type: FieldType.TT_FULL_DATE,
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
          type: FieldType.TT_BATCH_VERIFICATION,
          options: () => this.selectedDrugs,
        },
        {
          id: "reasons",
          helpText: "Select reason",
          type: FieldType.TT_SELECT,
          options: (formdata: any) => this.getReasons(formdata),
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
      const columns = ["Drug", "Amount per unit", "Total units", "Expiry date", 'Batch number'];
      const rows = d.map((d: any) => {
        return [d.shortName, d.tabs, d.tins, HisDate.toStandardHisDisplayFormat(d.expiry), d.batchNumber]
      });
      return [{
        label: "Confirm entry",
        value: "Table",
        other: { columns, rows },
      }];
    },
    prepDrugs(formdata: any) {
      const items: any[] = [];
      const barcode = this.barcode;
      formdata.enter_batches.value.forEach((element: any) => {
         items.push({
                            'batch_number': element.batchNumber,
                            'items' : [{
                            'barcode': barcode,
                            'drug_id': element.drugID,
                            'expiry_date': element.expiry,
                            'quantity': parseInt(element.tabs) * parseInt(element.tins),
                            'delivery_date': formdata.date.value,
                            }]
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
      const f = await Service.getJson('pharmacy/items', {paginate: false});
      return this.formatDrugs(f); 
    },
    mapVal(vals: string[]) {
      return vals.map(data => { return {label: data, value: data}});
    },
    getReasons(formdata: any): any {
      if (formdata.task.value === "Relocations") {
        return this.mapVal(["Transfer to another facility/relocation", "For trainings"]);
      }else {
        return this.mapVal(["Expired", "Damaged", "For trainings"]);
      }
    },
    formatDrugs(f: any) {
      return f.map((drug: any) => {
        return {
          label: drug.drug_name,
          value: drug,
        };
      });
    },
  },
  created() {
    this.fields = this.getFields();
    // this.drugs = this.formatDrugs();
  },
});
</script>