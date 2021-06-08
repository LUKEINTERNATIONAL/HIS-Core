import { FieldType } from "@/components/Forms/BaseFormElements"

export interface Option {
    label: string;
    value: string | number;
    isChecked?: boolean;
}

export interface Field {
    id: string | number;
    helpText: string;
    type: FieldType;
    condition?: Function;
    validation?: Function;
    options?(fdata?: any): Promise<Option[]> | Array<Option>;
    requireNext?: boolean;
    config?: Record<string, any>;
}
