<template>
  <table class="report-table">
    <thead class='stick-report-header' v-if="tableColumns">
        <tr>
            <th @click="sort(columnIndex, column)"
                :key="columnIndex" :style="column.style" :class="column.cssClass"
                v-for="(column, columnIndex) in tableColumns" >
                {{ column.th }}
                <ion-icon
                    v-if="sortedIndex === columnIndex"
                    :icon="sortOrder==='ascSort' ? arrowUp : arrowDown"
                ></ion-icon>
            </th>
        </tr>
    </thead>
    <tbody v-if="rows">
        <tr v-for="(row, rowIndex) in tableRows" :key="rowIndex">
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
import { arrowUp, arrowDown } from "ionicons/icons";
import table from "@/components/DataViews/tables/ReportDataTable"
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
    arrowUp: arrowUp,
    arrowDown: arrowDown,
    sortedIndex: -1 as number,
    sortOrder: 'descSort' as 'ascSort' | 'descSort',
    tableColumns: [] as Array<ColumnInterface>,
    tableRows: [] as Array<RowInterface[]>
  }),
  watch: {
    rows: {
        handler(rows: Array<RowInterface[]>) {
            if (rows) {
                if (this.showIndex()) {
                    this.tableRows = [...rows].map((r, i) => ([
                        table.td(i + 1), ...r
                    ]))
                    this.tableColumns = [table.thNum("#"), ...this.columns]
                } else {
                    this.tableRows = [...rows]
                    this.tableColumns = [...this.columns]
                }
            }
        },
        immediate: true,
        deep: true
    }
  },
  methods: {
    showIndex() {
        if (this.config && 'showIndex' in this.config) {
            return this.config.showIndex
        }
        return true
    },
    sort(index: number, column: any ) {
        if (index === this.sortedIndex) {
            this.sortOrder = this.sortOrder === 'ascSort' ? 'descSort' : 'ascSort'
        } else {
            this.sortOrder = 'ascSort'
            this.sortedIndex = index
        }
        if (this.sortOrder in column) {
            this.tableRows = column[this.sortOrder](index, this.tableRows)
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
        border: 2px solid #c5c5c5;
    }
</style>