<template>
  <div class="report-content">
    <report-table
      :rows="rows"
      :columns="columns"
      :paginated="true"
      :itemPerPage="5"
      :config="{ showIndex: false }"
    ></report-table>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from "vue";
import { isArray } from "lodash";
import ReportTable from "@/components/DataViews/tables/ReportDataTable.vue"
import table, { ColumnInterface, RowInterface } from "@/components/DataViews/tables/ReportDataTable"

const smallText = {style: {fontSize: '10px'}}
const largeText = {style: {fontSize: '16px'}, color: 'yellow'}

export default defineComponent({
  name: "HisResultCard",
  components: {
    ReportTable
  },
  data: () => ({
    columns: [[
      table.thTxt('Date', largeText),
      table.thTxt('Weight', largeText),
      table.thTxt('Reg', largeText),
      table.thTxt('ADH', largeText),
      table.thTxt('Outcome', largeText),
      table.thTxt('Actions', largeText)
    ]] as ColumnInterface[][],
  }),
  props: {
    icon: {
      required: false,
    },
    items: {
      type: Object as PropType<any[]>,
      required: true,
    },
  },
  methods: {
    printLabel(date: any) {
      this.$emit("onPrint", date);
    },
    showMore(date: any) {
      this.$emit("onDetails", date);
    },
    formatAdherence(vals: any) {
      if (isArray(vals)) {
        const f = [...vals];
        if (isArray(f)) {
          let j = "";
          f.forEach((element) => {
            j += `${element.join(":")} (%), `;
          });
          return j;
        }
        return f;
      } else {
        return vals;
      }
    },
  },
  computed: {
    rows(): RowInterface[][] {  
      return this.items.map((item) => {
        return [
          table.tdBtn(item.label, () => this.printLabel(item.value), smallText),
          table.td(item.data.weight, smallText),
          table.td(item.data.regimen, smallText),
          table.td(this.formatAdherence(item.data.adherence), smallText),
          table.td(item.data.outcome, smallText),
          table.tdBtn('show more', () => this.showMore(item.value), smallText)
        ]
      })
    }
  }
});
</script>