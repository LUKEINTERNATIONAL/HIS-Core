import HisDate from "@/utils/Date"
import { sort } from 'fast-sort';

export interface TableInterface {
    showIndex?: boolean;
}
export interface ColumnInterface {
    th: string | number | Date;
    type: 'string' | 'date' | 'number';
    value?: string;
    colspan?: number;
    sortable?: boolean;
    ascSort?: Function;
    descSort?: Function;
    exportable?: boolean;
    style?: Record<string, any>;
    cssClass?: string;
}
export interface EventInterface {
    obj: 'button' | 'link' | 'cell';
    color?: string;
    click: Function;
}
export interface RowInterface {
    td: string | number | Date;
    value?: string | number | Date;
    style?: Record<string, any>;
    cssClass?: string;
    event?: EventInterface;
}
export function prepareCSVValue(value: string | number | Date) {
    if(typeof value !== 'string') return value
    return value.replace(/,/gi, ' ').trim()
}
export function toExportableFormat(columns: Array<ColumnInterface[]>, rows: Array<RowInterface[]>) {
    const strRows: Array<any> = []
    const strCols: Array<any> = []
    for(const index  in rows) {
        const exportableRow: any = []
        rows[index].forEach((r, i) => {
            /*
                Last column of columns is the preferred source of reference
                for checking if a row cell is exportable
            */
            const column = columns[columns.length-1][i]
            if ('exportable' in column && column.exportable) {
                exportableRow.push(r.value ? prepareCSVValue(r.value) : prepareCSVValue(r.td))
            }
        })
        strRows.push(exportableRow)
    }
    for(const index  in columns) {
        const exportableColumns: any = []
        columns[index].forEach((c) => {
            if (c.exportable) {
                exportableColumns.push(c.value ? prepareCSVValue(c.value) : prepareCSVValue(c.th))
            } 
        })
        strCols.push(exportableColumns)
    }
    return {columns: strCols, rows: strRows}
}
function configCell(conf: any) {
    const attributes: any  = {
        th: () => {
            return conf.th ? conf.th : ''
        },
        td: () => {
            return conf.td ? conf.td : ''
        },
        value: () => {
            return conf.value ? conf.value : ''
        },
        type() {
            return conf.type ? conf.type : 'string'
        },
        exportable() {
            return 'exportable' in conf ? conf.exportable : true
        },
        sortable() {
            return 'sortable' in conf ? conf.sortable : true
        },
        colspan() {
            return conf.colspan ? conf.colspan : 0
        },
        cssClass() {
            return conf.cssClass ? conf.cssClass : 0
        },
        style(){
            return conf.style ? conf.style : 0
        },
        ascSort() {
            if (!conf.ascSort) {
                return (index: number, rows: Array<RowInterface[]>) => {
                    return sort(rows).asc(r => r[index].td)
                }
            }
            return conf.ascSort
        },
        descSort(){
            if (!conf.descSort) {
                return (index: number, rows: Array<RowInterface[]>) => {
                    return sort(rows).desc(r => r[index].td)
                }
            }
            return conf.descSort
        }
    }
    const finalConf: any = {}
    for(const attr in attributes) {
        finalConf[attr] = attributes[attr]()  
    }
    return finalConf
}

function thTxt(th: string | number | Date, params={} as any): ColumnInterface {
    const data = params
    data.th = th
    data.type = 'string'
    return configCell(data)
}

function thDate(th: string | number | Date, params={} as any): ColumnInterface  {
    const data = params
    data.th = th
    data.type = 'date'
    return configCell(data)
}

function thNum(th: string | number | Date, params={} as any): ColumnInterface {
    const data = params
    data.th = th
    data.type = 'number'
    return configCell(data)
}

function tdDate(td: string, params={} as RowInterface): RowInterface {
    const data = params
    data.td = HisDate.toStandardHisDisplayFormat(td)
    return configCell(data)
}

function td(td: string | number | Date, params={}): RowInterface {
    return  { td, ...params }
}

function tdLink(td: string | number | Date, click: Function, params={}): RowInterface {
    return {
        td,
        event: {
            click,
            obj: 'link'
        },
        ...params
    }
}

function tdBtn(td: string | number | Date, click: Function, params={} as any, color=''): RowInterface {
    const data = {
        td,
        event: {
            click,
            color: color,
            obj: 'button'
        }
    }
    if (params.event) {
        data.event = { ...data.event, ...params.event}
        delete params.event
    }
    return Object.assign(data, params)
}
export default {
    thTxt,
    thNum,
    thDate,
    td,
    tdBtn,
    tdDate,
    tdLink,
}