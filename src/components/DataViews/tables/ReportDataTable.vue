<template>
    <ion-page>
        <ion-header v-show="showFilters"> 
            <ion-toolbar>
                <ion-row>
                    <ion-col v-if="paginated">
                        <br/>
                        <select class="input_display" v-model="itemsPerPage" :disabled="isLoading">
                            <option :selected="currentPage === 5" value="5">5 rows/page</option>
                            <option :selected="currentPage === 10" value="10">10 rows/page</option>
                            <option :selected="currentPage === 20" value="20">20 rows/page</option>
                            <option :selected="currentPage === 50" value="50">50 rows/page</option>
                            <option :selected="currentPage === 100" value="100">100 rows/page</option>
                            <option :selected="currentPage === 1000" value="1000">1000 rows/page</option>
                            <option :selected="currentPage === tableRows.length" :value="tableRows.length">Show all rows</option>
                        </select>
                    </ion-col>
                    <ion-col>
                        <ion-input
                            class="input_display"
                            :value="searchFilter"
                            @click="launchSearcher"
                            placeholder="Search here...">
                        </ion-input>
                        <!-- <input type="search" placeholder="search here..."> -->
                    </ion-col>
                </ion-row>
            </ion-toolbar>
        </ion-header>
        <ion-content>
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
                v-if="!searchFilter"
                v-show="showPagination"
                :perPage="itemsPerPage"
                :maxVisibleButtons="10"
                :currentPage="currentPage"
                :totalPages="totalPages"
                @onChangePage="onChangePage"
            />
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { FieldType } from "../../Forms/BaseFormElements";
import { arrowUp, arrowDown, caretBack, caretForward } from "ionicons/icons";
import table from "@/components/DataViews/tables/ReportDataTable"
import { isEmpty } from "lodash";
import Pagination from "@/components/Pagination.vue";
import { chunk } from "lodash"
import { delayPromise } from "@/utils/Timers"
import { toastDanger } from "@/utils/Alerts";
import {
    ColumnInterface,
    RowInterface,
    TableInterface
} from "@/components/DataViews/tables/ReportDataTable"
import { 
    IonInput,
    IonPage,
    IonButton, 
    IonIcon, 
    IonSkeletonText,
    IonToolbar,
    IonHeader,
    IonCol,
    IonContent,
    modalController
} from "@ionic/vue"
import TouchField from "@/components/Forms/SIngleTouchField.vue"
import { Field } from "../../Forms/FieldInterface";

export default defineComponent({
  emits: ['onActiveRows', 'onActiveColumns'],
  components: {
    IonInput,
    IonContent,
    IonPage,
    IonButton, 
    IonIcon, 
    Pagination, 
    IonSkeletonText, 
    IonToolbar,
    IonHeader,
    IonCol
  },
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
    showFilters: {
        type: Boolean,
        default: false
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
    searchFilter: '' as string,
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
            this.paginateTableRows(perPage)
            await this.setPage(this.currentPage)
            this.isLoading = false
        }
    },
    searchFilter(searchTerm: string) {
        if (!searchTerm) {
            this.paginated ? this.setPage(this.currentPage) : this.activeRows = this.tableRows
        } else {
            this.activeRows = this.searchDataSet(
                searchTerm, this.paginated ? this.activeRows : this.tableRows 
            )
        }
    },
    activeRows: {
        handler(rows: any) {
            if (!isEmpty(rows)) this.$emit('onActiveRows', rows)
        },
        immediate: true,
        deep: true
    },
    columns: {
        handler(columns: Array<ColumnInterface[]>) {
            if (isEmpty(columns)) return

            if (this.showIndex()) {
                const tcolumns: Array<any[]> = [...this.columns]
                const lastColIndex = this.columns.length-1
                tcolumns[lastColIndex] = [table.thNum("#"), ...tcolumns[lastColIndex]]
                this.tableColumns = tcolumns
            } else {
                this.tableColumns = columns
            }
            this.$emit('onActiveColumns', this.tableColumns)
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
                        this.paginateTableRows()
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
                this.paginateTableRows()
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
    paginateTableRows(perPage=0) {
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
                this.paginateTableRows()
                await this.setPage(this.currentPage)
            } else {
                this.activeRows = column[this.sortOrder](index, this.tableRows)
            }
            this.isLoading = false
        }
    },
    searchDataSet(searchTerm: string, dataset: Array<any>) {
        return dataset.filter((r: any) => {
            const found = r.filter((rowData: any) => {
                if (typeof rowData === 'object' && rowData !=null &&  'td' in rowData) {
                    if (typeof rowData.td === 'string' || typeof rowData.td === 'number') {
                        return rowData.td.toString().match(new RegExp(searchTerm, 'i'))
                    }
                    return false
                }
                return false
            })
            return !isEmpty(found)
        })
    },
    launchSearcher() {
        this.launchKeyboard({
            id: 'search',
            helpText: 'Search table data',
            defaultValue: () => this.searchFilter,
            type: FieldType.TT_TEXT,
        }, (data: any) => {
            this.searchFilter = data ? data.value : ''
        })
    },
    async launchKeyboard(currentField: Field, onFinish: Function) {
      const modal = await modalController.create({
        component: TouchField,
        backdropDismiss: false,
        cssClass: "full-modal",
        componentProps: {
          dismissType: 'modal',
          currentField,
          onFinish
        }
      });
      modal.present();
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
        font-size: 0.8em;
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
        font-size: 1.2em!important;
    }
    th, td {
        width: 3%;
        border-collapse: collapse;
        text-align: center;
    }
    td {
        border-bottom: 1px solid rgb(165, 165, 165);
        padding: 0.5em;
        font-weight: 500;
        font-size: 1.3em;
    }
    tr:nth-child(even) {
        background-color: #f7f3f3;
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