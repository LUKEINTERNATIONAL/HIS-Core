<template>
  <table class="report-table">
    <thead class='stick-report-header' v-if="columns">
        <tr>
            <th :show="showIndex"> # </th>
            <th @click="sort(columnIndex, column)"
                :key="columnIndex" :style="column.style" :class="column.cssClass"
                v-for="(column, columnIndex) in columns" >
                {{ column.th }}
            </th>
        </tr>
    </thead>
    <tbody v-if="rows">
        <tr v-for="(row, rowIndex) in tableRows" :key="rowIndex">
            <td :show="showIndex"> {{ rowIndex + 1 }} </td>
            <td :class="item.cssClass" :style="item.style"
                v-for="(item, itemIndex) in row" :key="itemIndex"> 
                <div v-if="item.event"> 
                    <a href="#" :style="item.style" :class="item.cssClass"
                        v-if="item?.event?.obj === 'link'"
                        @click.prevent="item.event.click()">
                        {{ item.td }}
                    </a>
                    <ion-button
                        :class="item.cssClass"
                        :style="item.style"
                        v-if="item.event.obj === 'button'"
                        @click="item.event.click()">
                        {{ item.td }}
                    </ion-button>
                </div>
                <div v-else> 
                    {{ item.td }}
                </div>
            </td>
        </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { 
    ColumnInterface, 
    RowInterface, 
    TableInterface
} 
from "@/components/DataViews/tables/ReportDataTable"

export default defineComponent({
  props: {
    config: {
        type: Object as PropType<TableInterface>,
        default: {}
    },
    columns: {
      type: Object as PropType<ColumnInterface[]>,
      required: true
    },
    rows: {
      type: Object as PropType<RowInterface[]>,
      required: true
    }
  },
  data: () => ({
    tableRows: [] as Array<RowInterface[]>
  }),
  watch: {
    rows: {
        handler(rows: Array<RowInterface[]>) {
            if (rows) {
                this.tableRows = rows
            }
        },
        immediate: true,
        deep: true
    }
  },
  computed: {
    showIndex(): boolean {
        if ('showIndex' in this.config) {
            return this.config.showIndex ? true : false
        }
        return true
    }
  },
  methods: {
    sort(index: number, column: ColumnInterface ) {
        if (column.ascSort) {
            this.tableRows = column.ascSort(index, this.tableRows)
            console.log(this.tableRows)
        }
    }
  }
})
</script>

<style scoped> 
    .report-table {
        width: 100%;
        position: relative;
        text-align: left;
        border-collapse: collapse;
        padding: 1em;
    }
    .stick-report-header {
        background: white;
        position: sticky;
        top: 0;
    }
    th {
        background: rgb(233, 233, 233);
    }
    th, td {
        width: 3%;
        padding: 0.6em;
        text-align: center;
    }
    td {
        border-collapse: collapse;
        border: 1px solid #c5c5c5;
    }
    tr:nth-child(even) {
        background-color: #f8f8f8;
    }
</style>