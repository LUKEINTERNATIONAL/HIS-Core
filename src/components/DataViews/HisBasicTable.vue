<template>
    <table class="his-table">
        <tr>
            <th v-for="(column, hIndex) in columns" :key="hIndex"> 
                {{ column }}
            </th>
        </tr>
        <tr  v-for="(dataItems, rIndex) in rows" :key="rIndex">
            <td 
                :class="getColorCodeClass(rIndex, dIndex)" 
                v-for="(item, dIndex) in dataItems" :key="dIndex"
                > 
                <div v-if="isActionButton(item)"> 
                    <ion-button @click="item.action(dataItems)">{{ item.name }}</ion-button>
                </div>
                <div v-else>
                    {{ item }}
                </div>
            </td>
        </tr>
    </table>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { isEmpty } from "lodash"
export default defineComponent({
    props: {
        rowColors: {
            type: Array,
            default: () => []
        },
        cellColors:{
            type: Array,
            default: () => []
        },
        columns: {
            type: Object as PropType<string[]>,
            required: true
        },
        rows: {
            type: Object as PropType<string[]>
        }
    },
    methods: {
        isActionButton(item: any) {
            return typeof item === 'object' && item.type === 'button'
        },
        getColorCodeClass(rIndex: number, dIndex: number) {
            let styleClass = ''
            if (!isEmpty(this.rowColors)) {
                const row: any = this.rowColors.filter((i: any) => i.indexes.includes(rIndex))
                if (!isEmpty(row)) {
                    styleClass += ' ' + row[0].class
                }
            }

            if (!isEmpty(this.cellColors)) {
                const cell: any = this.cellColors.filter((i: any) => {
                    return i.index === dIndex && i.row === rIndex
                })
                if (!isEmpty(cell)) {
                    styleClass += ' ' + cell[0].class
                } 
            }
            return styleClass
        }
    }
})
</script>
