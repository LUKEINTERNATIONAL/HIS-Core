export interface TaskInterface {
    id: string;
    name: string;
    description?: string;
    url?: string;
    workflowID?: string;
    action?: Function;
    icon: string;
    condition?: (globalPropertyService: any, otherParams: any) => boolean | Promise<boolean>;
}