export interface TaskInterface {
    id: string;
    name: string;
    description?: string;
    condition?: (globalPropertyService: any) => boolean;
    url?: string;
    action?: Function;
    icon: string;
}