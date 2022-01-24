<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-row> 
          <ion-col> 
            <h1> {{title}} </h1>
          </ion-col>
        </ion-row>
      </ion-toolbar>
      <ion-toolbar> 
        <report-filter
          :showPerPageFilter="showFilters || paginated"
          :disableSearchFilter="isTableLoading"
          :disablePerPageFilter="isTableLoading"
          :totalRowCount="tableRows.length"
          @onItemsPerPage="(i) => itemsPerPage = i"
          @onSearchFilter="(f) => searchFilter = f"> 
        </report-filter>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="report-content">
        <report-table
          :rows="rows"
          :paginated="paginated"
          :asyncRows="asyncRows"
          :rowParser="rowParser"
          :columns="columns"
          :showFilters="showFilters"
          :newPage="currentPage"
          :searchFilter="searchFilter"
          :rowsPerPage="itemsPerPage"
          @onIsLoading="(l) => isTableLoading = l"
          @onTableRows="(r) => tableRows = r"
          @onPagination="(p) => totalPages = p.length"
          @onActiveColumns="(c) => activeColumns = c"
          @onActiveRows="(r) => activeRows = r">
        </report-table>
      </div>
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <pagination
          v-if="!searchFilter && paginated || !searchFilter && totalPages > 0 && paginated"
          :perPage="itemsPerPage"
          :maxVisibleButtons="10"
          :totalPages="totalPages"
          @onChangePage="(p) => currentPage=p"
          />
      </ion-toolbar>
      <ion-toolbar v-if="showReportStamp"> 
        <ion-chip color="primary">Date Generated: <b>{{ date }}</b></ion-chip>
        <ion-chip color="primary">API version: <b>{{ apiVersion }}</b></ion-chip>
      </ion-toolbar>
    </ion-footer>
    <his-footer :color="footerColor" :btns="btns"></his-footer>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import HisFooter from "@/components/HisDynamicNavFooter.vue";
import { toExportableFormat, ColumnInterface, RowInterface} from "@/components/DataViews/tables/ReportDataTable" 
import ReportTable from "@/components/DataViews/tables/ReportDataTable.vue"
import { IonCol, IonRow, IonPage,IonHeader, IonContent, IonToolbar, IonChip, IonFooter } from "@ionic/vue"
import { toCsv, toTablePDF } from "@/utils/Export"
import { Service } from "@/services/service"
import HisDate from "@/utils/Date"
import ReportFilter from "@/components/ReportFilter.vue"
import Pagination from "@/components/Pagination.vue"

export default defineComponent({
  components: {
    IonCol, 
    IonRow, 
    Pagination, 
    ReportTable, 
    ReportFilter, 
    HisFooter, 
    IonPage, 
    IonHeader,
    IonContent, 
    IonToolbar, 
    IonChip, 
    IonFooter 
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    columns: {
      type: Object as PropType<Array<ColumnInterface[]>>,
      required: true
    },
    rows: {
      type: Object as PropType<Array<RowInterface[]>>,
      default: () => []
    },
    rowParser: {
      type: Function
    },
    showFilters: {
      type: Boolean,
      default: false
    },
    rowsPerPage: {
      type: Number
    },
    asyncRows: {
      type: Function
    },
    paginated: {
      type: Boolean,
      default: false
    },
    customBtns: {
      type: Array,
      default: () => []
    },
    showReportStamp: {
      type: Boolean,
      default: true
    },
    footerColor: {
      type: String,
      default: 'dark'
    },
    customFileName: {
      type: String,
      default: ''
    },
    onFinish: {
      type: Function
    }
  },
  data: () => ({
    btns: [] as Array<any>,
    isTableLoading: false as boolean,
    searchFilter: '' as string,
    itemsPerPage: 50 as number,
    currentPage: 0 as number,
    tableRows: [] as any,
    totalPages: 0 as number,
    activeColumns: [] as any,
    activeRows: [] as any,
    date: HisDate.toStandardHisDisplayFormat(Service.getSessionDate()),
    apiVersion: Service.getApiVersion(),
  }),
  methods: {
    getFileName(){
      return this.customFileName ? this.customFileName : this.title
    }
  },
  created() {
    this.btns = [
      ...this.customBtns,
      {
        name: "CSV",
        size: "large",
        slot: "start",
        color: "primary",
        visible: true,
        onClick: () => {
          const {columns, rows} = toExportableFormat(this.activeColumns, this.activeRows)
          toCsv(columns, rows, this.getFileName())
        }
      },
      {
        name: "PDF",
        size: "large",
        slot: "start",
        color: "primary",
        visible: true,
        onClick: () => {
          const {columns, rows} = toExportableFormat(this.activeColumns, this.activeRows)
          toTablePDF(columns, rows, this.getFileName())
        }
      },
      {
        name: "Finish",
        size: "large",
        slot: "end",
        color: "success",
        visible: true,
        onClick: () => {
          if (typeof this.onFinish === 'function') {
            return this.onFinish()
          }
          this.$router.push({ path:'/' })
        }
      }
    ]
  }
})
</script>

