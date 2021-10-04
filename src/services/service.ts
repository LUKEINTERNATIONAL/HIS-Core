import ApiClient from "./api_client"
import Url from "@/utils/Url"
import HisApp from "@/apps/app_lib"
import { AppInterface } from "@/apps/interfaces/AppInterface"

export class Service {
    static ajxGet(url: string, params={}) {
        return ApiClient.get(`${url}?${Url.parameterizeObjToString(params)}`)
    }

    static async getText(url: string) {
        const req = await ApiClient.get(url)

        if (req && req.ok) return req?.text()
    }

    static async getJson(url: string, params = {} as Record<string, any>) {
        const transformedUrl = `${url}?${Url.parameterizeObjToString(params)}`
        const req = await ApiClient.get(transformedUrl)
        if (req && req.ok && [200, 201].includes(req.status)) {
            return req?.json()
        } 
    }

    static async postJson(url: string, data: any, genericError='Unable to save record') {
        const req = await ApiClient.post(url, data)
        if (req && req.ok) {
            if ([200, 201].includes(req.status)) {
                return req?.json()
            }
            return {}
        }
        throw genericError
    }

    static async putJson(url: string, data: Record<string, any>, genericError='Unable to update record') {
        const req = await ApiClient.put(url, data)

        if (req && req.ok) return req?.json()

        throw genericError
    }

    static async void(url: string, reason: Record<string, string>) {
        const req = await ApiClient.remove(url, reason)
   
        if (req && req.ok) return true

        throw 'Unable to delete record'
    }

    static async getApiDate() {
        const req = await this.getJson('current_time')
        if (req) {
            return req.date
        }
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

    static getCachedApiDate() {
        return sessionStorage.getItem('apiDate')
    }

    static async setSessionDate(sessionDate: string) {
        const apiDate = await this.getApiDate()
        if (apiDate) {
            sessionStorage.setItem('apiDate', apiDate)
            sessionStorage.setItem('sessionDate', sessionDate)
            return
        }
        throw 'Unable to set api date'
    }

    static async resetSessionDate() {
        const apiDate = await this.getApiDate()
        if (apiDate) {
            sessionStorage.removeItem('apiDate')
            sessionStorage.setItem('sessionDate', apiDate)
            return
        }
        throw 'Unable to reset session date'
    }

    static isBDE() {
        const apiDate = sessionStorage.getItem('apiDate')
        const sessionDate = sessionStorage.getItem('sessionDate')
        return apiDate && apiDate != sessionDate
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
