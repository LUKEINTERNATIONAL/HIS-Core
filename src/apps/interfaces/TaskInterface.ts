export interface TaskInterface {
    id: string;
    name: string;
    globalProperty?: string;
    availableOnActivitySelection?: boolean;
    description?: string;
    url?: string;
    workflowID?: string;
    action?: Function;
    icon: string;
    condition?: (params: any) => boolean | Promise<boolean>;
}