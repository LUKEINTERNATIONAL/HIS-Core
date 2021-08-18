import ApiClient from "./api_client"
import Url from "@/utils/Url"
import HisApp from "@/apps/app_lib"
import { AppInterface } from "@/apps/interfaces/AppInterface"

export class Service {
    static async getText(url: string) {
        const req = await ApiClient.get(url)

        if (req && req.ok) return req?.text()
    }

    static async getJson(url: string, params = {} as Record<string, any>) {
        const transformedUrl = `${url}?${Url.parameterizeObjToString(params)}`
        const req = await ApiClient.get(transformedUrl)

        if (req && req.ok) return req?.json()
    }

    static async postJson(url: string, data: any, genericError='Unable to save record') {
        const req = await ApiClient.post(url, data)

        if (req && req.ok) return req?.json()

        throw genericError
    }

    static async void(url: string, reason: Record<string, string>) {
        const req = await ApiClient.remove(url, reason)
   
        if (req && req.ok) return true

        throw 'Unable to delete record'
    }

    static getActiveApp(): AppInterface | {} { 
        return HisApp.getActiveApp() || {}
    }

    static getUserLocation() {
        return sessionStorage.getItem('userLocation')
    }
    static getLocationName() {
        return sessionStorage.getItem('locationName')
    }
    
    static getSessionDate() {
        return sessionStorage.getItem('sessionDate') || '';
    }
    
    static setSessionDate(date: string) {
        sessionStorage.setItem('sessionDate', date)
    }

    static getProgramID() {
        const app = this.getActiveApp()
        
        if ('programID' in app) return app.programID
        
        return 0;
    }
    
    static getUserRoles() {
       const roles = sessionStorage.getItem('userRoles');
       
       return roles ? JSON.parse(roles) : []
    }
    static getUserName() {
       return sessionStorage.username;
    }
}
