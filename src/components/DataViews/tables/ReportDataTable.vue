<template>
  <table class="report-table">
    <thead class='stick-report-header' v-if="tableColumns">
        <tr v-for="(columns, colIndex) in tableColumns" :key="colIndex">
            <th v-for="(column, columnIndex) in columns" 
                :key="columnIndex"
                :colspan="column.colspan || 0"
                @click="sort(columnIndex, column)"
                :style="column.style" 
                :class="column.cssClass">
                {{column.th}}
                <ion-icon
                    v-if="sortedIndex === columnIndex && column.sortable"
                    :icon="sortOrder==='ascSort' ? arrowUp : arrowDown"
                ></ion-icon>
            </th>
        </tr>
    </thead>
    <tbody v-if="rows">
        <tr v-for="(row, rowIndex) in paginatedItems" :key="rowIndex">
            <td v-for="(item, itemIndex) in row" :key="itemIndex"
                :colspan="item.colspan || 0"
                :class="item.cssClass" 
                :style="item.style"
                > 
                <div v-if="item.event"> 
                    <a href="#" :style="item.style" :class="item.cssClass"
                        v-if="item?.event?.obj === 'link'"
                        @click.prevent="item.event.click()">
                        {{ item.td }}
                    </a>
                    <ion-button
                        :color="item?.event?.color || ''"
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
  <div class="pagination" v-if="showPagination">
        <div class="btn-group">
            <ion-button color="light" @click="prevPage">
                <ion-icon :icon="caretBack"></ion-icon>
            </ion-button>
            <ion-button
                v-for="page in pages"
                @click="currentPage = page"
                :color="currentPage === page ? 'primary' : 'light'"
                :key="page" >
                {{ page + 1 }}
            </ion-button>
            <ion-button color="light" @click="nextPage">
                <ion-icon :icon="caretForward"></ion-icon>
            </ion-button>
        </div>
        <h6>Page {{ currentPage + 1 }} of {{ totalPages }}</h6>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { arrowUp, arrowDown, caretBack, caretForward } from "ionicons/icons";
import { 
    ColumnInterface, 
    RowInterface, 
    TableInterface
} 
from "@/components/DataViews/tables/ReportDataTable"
import table from "@/components/DataViews/tables/ReportDataTable"
import { isEmpty } from "lodash";
import {
    IonButton,
    IonIcon
} from "@ionic/vue"
export default defineComponent({
  components: { IonButton, IonIcon},
  props: {
    config: {
        type: Object as PropType<TableInterface>,
        default: {}
    },
    columns: {
      type: Object as PropType<Array<ColumnInterface[]>>,
      required: true
    },
    rows: {
      type: Object as PropType<Array<RowInterface[]>>,
      required: true
    },
    paginated: {
        type: Boolean,
        default: true
    },
    itemsPerPage: {
        type: Number,
        default: 5
    }
  },
  data: () => ({
    arrowUp: arrowUp,
    arrowDown: arrowDown,
    caretBack, 
    caretForward,
    sortedIndex: -1 as number,
    sortOrder: 'descSort' as 'ascSort' | 'descSort',
    tableColumns: [] as Array<ColumnInterface[]>,
    tableRows: [] as Array<RowInterface[]>,
    currentPage: 0,
  }),
  watch: {
    columns: {
        handler(columns: Array<ColumnInterface[]>) {
            if (!columns) {
                return
            } 
            if (this.showIndex() && !isEmpty(this.columns)) {
                const tcolumns: Array<any[]> = [...this.columns]
                const lastColIndex = this.columns.length-1
                tcolumns[lastColIndex] = [table.thNum("#"), ...tcolumns[lastColIndex]]
                this.tableColumns = tcolumns
            } else {
                this.tableColumns = this.columns
            }
        },
        immediate: true,
        deep: true
    },
    rows: {
        handler(rows: Array<RowInterface[]>) {
            if (!rows) {
                return
            }
            if (this.showIndex() && !isEmpty(this.rows)) {
               this.tableRows = this.rows.map((r, i) => ([table.td(i + 1), ...r]))
            } else {
                this.tableRows = rows
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
    },
    prevPage(){
        if(this.currentPage) this.currentPage--
    },
    nextPage(){
        if((this.currentPage + 1) !== this.totalPages) this.currentPage++
    }
  },
  computed: {
    paginatedItems(): RowInterface[][] {
        if (!this.paginated) return this.tableRows
        return this.tableRows.slice(
            this.itemsPerPage * this.currentPage,
            this.itemsPerPage * (this.currentPage + 1)
        )
    },
    totalPages(): number {
        return Math.ceil(this.tableRows.length / this.itemsPerPage)
    },
    pages(): number[] {
        return Array.from(Array(this.totalPages).keys())
    },
    showPagination(): boolean {
       return this.paginated && !!this.paginatedItems.length && this.totalPages > 1
    }
  }
})
</script>

<style scoped> 
    a {
        text-decoration: none;
        font-weight: 600;
        font-size: 1em;
    }
    .report-table {
        width: 100%;
        position: relative;
        text-align: left;
        font-size: 0.9em;
    }
    .stick-report-header {
        background: white;
        position: sticky;
        top: 0;
    }
    table {
        width: 100%;
        border-collapse: unset;
    }
    th {
        background: #3880ff;
        color: white;
        padding: 0.5em;
    }
    th, td {
        width: 3%;
        border-collapse: collapse;
        text-align: center;
    }
    td {
        border-bottom: 2px solid rgb(165, 165, 165);
        padding: 0.5em;
        font-weight: 500;
        font-size: 1.2em;
    }
    tr:nth-child(even) {
        background-color: #f0f0f0;
    }

    .pagination {
        display: flex;
        justify-content: space-between;
        justify-items: center;
    }
    .pagination .btn-group {
        margin: .5rem;
        display: flex;
        justify-content: start;
    }

    .pagination ion-button {
        margin: .1rem;
    }

    h6 {
        margin-right: .5rem;
    }

    .pagination .active {
        background-color: blue;
        color: white;
    }
</style>