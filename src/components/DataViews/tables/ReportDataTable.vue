<template>
  <table class="report-table">
    <thead class='stick-report-header' v-if="columns">
        <tr>
            <th> # </th>
            <th v-for="(column, columnIndex) in columns" :key="columnIndex">
                <div v-html="column"></div>
            </th>
        </tr>
    </thead>
    <tbody v-if="rows">
        <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
            <td> {{ rowIndex + 1 }} </td>
            <td v-for="(item, itemIndex) in row" :key="itemIndex">
                <div v-if="isLink(item)">
                    <div v-if="item.isActive">
                        <a href="#" @click.prevent="item.action(dataItems)">
                            {{ item.value }}
                        </a>
                    </div>
                    <div v-else>
                        {{ item.value }}
                    </div>
                </div>
                <div v-else-if="isActionButton(item)">
                    <ion-button @click="item.action(dataItems)">
                        {{ item.name }}
                    </ion-button>
                </div>
                <div v-else>
                    {{ item }}
                </div>
            </td>
        </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
export default defineComponent({
  props: {
    columns: {
      type: Object as PropType<string[]>,
      required: true
    },
    rows: {
      type: Object as PropType<string[]>,
      required: true
    }
  },
  methods: {
    isLink(item: any) {
        return this.isActionType(item, 'link')
    },
    isActionButton(item: any) {
        return this.isActionType(item, 'button')
    },
    isActionType(item: any, expected: string) {
        try {
            return typeof item === "object" && item.type === expected;
        }catch(e) {
            return item
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
    th, td {
        padding: 1.1em;
        text-align: left;
    }
    td {
        border-collapse: collapse;
        border: 1px solid #c5c5c5;
    }
    tr:nth-child(even) {
        background-color: #f8f8f8;
    }
</style>