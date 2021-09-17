import HisDate from "@/utils/Date"
import { sort } from 'fast-sort';

export interface TableInterface {
    showIndex?: boolean;
}

export interface ColumnInterface {
    th: string;
    type: 'string' | 'date' | 'number';
    value?: string;
    sortable?: boolean;
    ascSort?: Function;
    descSort?: Function;
    exportable?: boolean;
    style?: Record<string, any>;
    cssClass?: string;
}

export interface EventInterface {
    obj: 'button' | 'link' | 'cell';
    click: Function;
}

export interface RowInterface {
    td: string | number | Date;
    value?: string | number | Date;
    style?: Record<string, any>;
    cssClass?: string;
    event?: EventInterface;
}

function thTxt(th: string, value='', style={}, cssClass='', sortable=true, exportable=true): ColumnInterface {
    return {
        th,
        type: 'string',
        value,
        style,
        cssClass,
        sortable,
        ascSort: (index: number, rows: Array<RowInterface[]>) => {
            return sort(rows).asc(r => r[index].td)
        },
        descSort: (index: number, rows: Array<RowInterface[]>) => {
            return sort(rows).desc(r => r[index].td)
        },
        exportable
    }
}

function thDate(th: string, value='', style={}, cssClass='', sortable=true, exportable=true): ColumnInterface  {
    return {
        th,
        type: 'date',
        value,
        style,
        cssClass,
        sortable,
        ascSort: (index: number, rows: Array<RowInterface[]>) => {
            return sort(rows).asc(r => r[index].td)
        },
        descSort: (index: number, rows: Array<RowInterface[]>) => {
            return sort(rows).desc(r => r[index].td)
        },
        exportable
    }
}

function thNum(th: string, value='', style={}, cssClass='', sortable=true, exportable=true): ColumnInterface {
    return {
        th,
        type: 'number',
        value,
        style,
        cssClass,
        sortable,
        ascSort: (index: number, rows: Array<RowInterface[]>) => {
            return sort(rows).asc(r => r[index].td)
        },
        descSort: (index: number, rows: Array<RowInterface[]>) => {
            return sort(rows).desc(r => r[index].td)
        },
        exportable
    }
}

function tdDate(td: string, value='', cssClass='', style={}): RowInterface {
    return {
        td: HisDate.toStandardHisDisplayFormat(td),
        style,
        value,
        cssClass
    }
}

function td(td: string, params={}): RowInterface {
    return { td, ...params }
}

function tdLink(td: string, click: Function, params={}): RowInterface {
    return {
        td,
        event: {
            click,
            obj: 'link'
        },
        ...params
    }
}

function tdBtn(td: string, click: Function, params={}): RowInterface {
    return {
        td,
        event: {
            click,
            obj: 'button'
        },
        ...params
    }
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