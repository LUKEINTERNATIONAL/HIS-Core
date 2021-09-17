import HisDate from "@/utils/Date"

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
        ascSort: () => {
            //TODO: Add ascending sort algorithm
        },
        descSort: () => {
            //TODO: Add descending sort algorithm
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
        ascSort: () => {
            //TODO: Add ascending sort algorithm
        },
        descSort: () => {
            //TODO: Add descending sort algorithm
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
        ascSort: () => {
            //TODO: Add ascending sort algorithm
        },
        descSort: () => {
            //TODO: Add descending sort algorithm
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

function td(td: string, value='', cssClass='', style={}): RowInterface {
    return {
        td,
        style,
        value,
        cssClass
    }
}

function tdLink(td: string, click: Function, cssClass='', style={}): RowInterface {
    return {
        td,
        style,
        event: {
            click,
            obj: 'link'
        },
        cssClass
    }
}

function tdBtn(td: string, click: Function, cssClass='', style={}): RowInterface {
    return {
        td,
        style,
        event: {
            click,
            obj: 'button'
        },
        cssClass
    }
}

function tdCell(td: string, click: Function, cssClass='', style={}): RowInterface {
    return {
        td,
        style,
        event: {
            click,
            obj: 'cell'
        },
        cssClass
    }
}

export default {
    thTxt,
    thNum,
    thDate,
    td,
    tdDate,
    tdCell,
    tdBtn,
    tdLink,
}