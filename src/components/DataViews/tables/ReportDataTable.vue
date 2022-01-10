<template>
    <ion-page>
        <div class="report-table-top" v-show="!noData && paginated">
            <div style="display: flex; justify-content: space-between; position: sticky; top:0">
                <div>
                    items per page 
                    <select v-model="itemsPerPage" :disabled="isLoading">
                        <option :selected="currentPage === 5" value="5">5</option>
                        <option :selected="currentPage === 10" value="10">10</option>
                        <option :selected="currentPage === 20" value="20">20</option>
                        <option :selected="currentPage === 50" value="50">50</option>
                        <option :selected="currentPage === 100" value="100">100</option>
                        <option :selected="currentPage === 1000" value="1000">1000</option>
                        <option :selected="currentPage === tableRows.length" :value="tableRows.length">All</option>
                    </select>
                </div>
                <input type="search" placeholder="search here...">
            </div>
        </div>
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
            <!-- Skeleton Rows -->
            <tbody v-if="isLoading"> 
                <tr v-for="(skeletonRow, skeletonIndex) in skeletonRows" :key="skeletonIndex">
                    <td :colspan="columnLength">
                        <ion-skeleton-text animated style="width: 100%; height: 30px;"></ion-skeleton-text>
                    </td>
                </tr>
            </tbody>
            <!-- End skeleton rows --->
            <tbody v-if="!noData">
                <tr v-for="(row, rowIndex) in activeRows" :key="rowIndex">
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
                                :disabled="item?.event?.disabled != undefined
                                    ? item.event.disabled === true
                                    : false"
                                v-if="item.event.obj === 'button'"
                                @click="item.event.click()">
                                {{ item.td }}
                            </ion-button>
                        </div>
                        <div v-else> 
                            <span v-html="item.td"></span>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <h1 v-if="noData" class="no-data-section vertically-align"> 
            <span v-if="errorMessage"> 
                {{ errorMessage }}
            </span> 
            <span v-else> 
                No data available in table
            </span>
        </h1>
        <pagination 
            v-show="showPagination"
            :perPage="itemsPerPage"
            :maxVisibleButtons="10"
            :currentPage="currentPage"
            :totalPages="totalPages"
            @onChangePage="onChangePage"
        />
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { arrowUp, arrowDown, caretBack, caretForward } from "ionicons/icons";
import table from "@/components/DataViews/tables/ReportDataTable"
import { isEmpty } from "lodash";
import Pagination from "@/components/Pagination.vue";
import { chunk } from "lodash"
import { IonButton, IonIcon, IonSkeletonText } from "@ionic/vue"
import { delayPromise } from "@/utils/Timers"
import { toastDanger } from "@/utils/Alerts";
import {
    ColumnInterface,
    RowInterface,
    TableInterface
} from "@/components/DataViews/tables/ReportDataTable"

export default defineComponent({
  components: { IonButton, IonIcon, Pagination, IonSkeletonText },
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
      type: Object as PropType<Array<any[]>>,
      default: () => []
    },
    asyncRows: {
        type: Function
    },
    rowParser: {
        type: Function
    },
    paginated: {
        type: Boolean,
        default: false
    },
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
    paginatedRows: [] as Array<any>,
    activeRows: [] as Array<any>,
    currentPage: 0,
    itemsPerPage: 20 as number,
    isLoading: false as boolean,
    errorMessage: '' as string
  }),
  watch: {
    async itemsPerPage(perPage: number) {
        if (!isEmpty(this.tableRows)) {
            this.currentPage = 0
            this.isLoading = true
            await delayPromise(100)
            this.paginateRows(perPage)
            await this.setPage(this.currentPage)
            this.isLoading = false
        }
    },
    columns: {
        handler(columns: Array<ColumnInterface[]>) {
            if (!columns) return

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
    asyncRows: {
        async handler(func: Function) {
            this.errorMessage = ''
            if (typeof func === 'function') {
                this.isLoading = true
                try {
                    this.tableRows = this.addColumnIndexes(await func())
                    if (this.paginated) {
                        this.paginateRows()
                        await this.setPage(0)
                    } else {
                        this.activeRows = this.tableRows
                    }
                } catch (e) {
                    this.errorMessage = `${e}`
                    toastDanger(e)
                    console.error(e)
                }
                this.isLoading = false
            }
        },
        immediate: true,
        deep: true
    },
    rows: {
        async handler(rows: Array<any[]>) {
            this.errorMessage = ''
            if (!rows || isEmpty(rows)) return

            this.isLoading = true
            this.tableRows = this.addColumnIndexes(rows)

            if (this.paginated) {
                this.paginateRows()
                await this.setPage(0)
            } else {
                this.activeRows = this.tableRows
            }
            this.isLoading = false
        },
        immediate: true,
        deep: true
    }
  },
  methods: {
    showIndex() {
        return this.config && 'showIndex' in this.config
            ?  this.config.showIndex
            : true
    },
    addColumnIndexes(rows: Array<any>) {
        return this.showIndex()
            ?
            rows.map((r, i) => {
                const row = [table.td(i + 1)]
                return Array.isArray(r) ? row.concat(r) : [...row, r]
            })
            : 
            rows
    },
    paginateRows(perPage=0) {
        this.paginatedRows = chunk(this.tableRows ,perPage ? perPage : this.itemsPerPage)
    },
    async setPage(index: number) {
        this.activeRows = []
        const pageRows = this.paginatedRows[index]
        try {
            this.activeRows = typeof this.rowParser === 'function'
                ? await Promise.all(this.rowParser(pageRows))
                : pageRows
        } catch (e) {
            toastDanger(e)
            this.errorMessage = `${e}`
            console.error(e)
        }
    },
    async sort(index: number, column: any ) {
        if (index === this.sortedIndex) {
            this.sortOrder = this.sortOrder === 'ascSort' ? 'descSort' : 'ascSort'
        } else {
            this.sortOrder = 'ascSort'
            this.sortedIndex = index
        }
        if (this.sortOrder in column) {
            this.isLoading = true
            if (this.paginated) {
                this.tableRows = column[this.sortOrder](index, this.tableRows)
                this.paginateRows()
                await this.setPage(this.currentPage)
            } else {
                this.activeRows = column[this.sortOrder](index, this.tableRows)
            }
            this.isLoading = false
        }
    },
    async onChangePage(page: number) {
        this.currentPage = page
        this.isLoading = true
        await this.setPage(page)
        this.isLoading = false
    }
  },
  computed: {
    noData(): boolean {
        return !this.isLoading && isEmpty(this.activeRows)
    },
    columnLength(): number {
        try {
            return this.tableColumns[this.tableColumns.length].length
        } catch (e) {
            console.warn(e)
            return 5
        }
    },
    skeletonRows(): Array<number> {
        const rows = []
        for(let i=0; i < this.itemsPerPage; ++i) {
            rows.push(i)
        }
        return rows
    },
    totalPages(): number {
        return this.paginatedRows.length
    },
    showPagination(): boolean {
       return this.paginated && this.totalPages > 1
    }
  }
})
</script>

<style scoped>
    .no-data-section {
        text-align: center;
        font-weight: bold;
        font-size: 1em;
        color: rgb(133, 133, 133);
    }
    a {
        text-decoration: none;
        font-weight: 600;
        font-size: 1em;
    }
    .report-table-top {
        padding: 1rem;
        position: relative;
        width: 100%;
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