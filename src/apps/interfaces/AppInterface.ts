import { RouteRecordRaw } from 'vue-router';
import { TaskInterface } from './TaskInterface';

export interface ActivityInterface {
    value: string;
    selected: boolean;
}

export interface FolderInterface {
    name: string;
    icon?: string;
    files: Array<
        {
            name: string;
            icon?: string;
            pathName?: string;
            pathUrl?: string;
        }
    >;
}

export interface GeneralDataInterface {
    label: string;
    value: string;
}

export interface AppInterface {
    /**
     * Map primary key value of a program here. All records will
     * associate with this program ID
    */
    readonly programID: number;
    /**
     * Name of the program as it will be presented on the Application Selection
     * list
     */
    readonly applicationName: string;
    /**
     * URL of the applicationIcon 
     */
    readonly applicationIcon: string;
    /**
     * Description of the app as it will appear during Application Selection
     */
    readonly applicationDescription: string;
    /**
     * Routes to different application resources
     */
    readonly appRoutes: Array<RouteRecordRaw>;
    /**
     * Identifiers available for search / reference that are unique to this programme
    */
    readonly programPatientIdentifiers?: Record<
        string, 
        {
            id: number;
            name: string;
            isPrimary: boolean;
            useForSearch: boolean;
            prefix: () => Promise<string> | string;
            globalPropertySetting?: string;
        }
    >;
    /**
     * Component that is rendered on the landing page that'll typically
     * show some sort of summary of activities
     */
    readonly homeOverviewComponent: any; //Vue component
    /**
     * Overwrites main patient dashboard component with specified one
     */
    readonly patientDashboardComponent?: any; // Vue component
    /**
     * Define all reports available for program
    */
    readonly programReports?: FolderInterface[];
    /**
     * Define list of all application configurations
     */
    readonly globalPropertySettings?: FolderInterface[];
    /**
     * primary patient activities
     */
    readonly primaryPatientActivites: TaskInterface[];
    /**
     * secondary patient activities
     */
    readonly secondaryPatientActivites: TaskInterface[];
    /**
     * Get program specific patient dashboard alerts
     */
    readonly getPatientDashboardAlerts: (patient: any) => Promise<GeneralDataInterface[]> | GeneralDataInterface[];
    /**
     * Onload event when the program is selected
    */
    readonly init?: () => void;
    /**
     * Parse summary data object based on program specific definition and
     * return generic object to be displayed on patient dashboard
     */
    readonly formatPatientDashboardSummary: (programInfo: any) => Promise<GeneralDataInterface[]> | GeneralDataInterface[];
    /**
     * Summary data that is rendered on patient confirmation page
    */
    readonly confirmationSummary?: (patient: any, program: any) => Record<string, Function>;
}
