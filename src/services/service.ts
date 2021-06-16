import ApiClient from "./api_client"
import Url from "@/utils/Url"

export class Service {
    static programID = sessionStorage.programID;
    static sessionDate = sessionStorage.sessionDate;
    
    static async getJson(url: string, params = {} as Record<string, string> | Record<string, number>) {
        const transformedUrl = `${url}?${Url.parameterizeObjToString(params)}`
        const req = await ApiClient.get(transformedUrl)

        if (req && req.ok) return req?.json()
    }

    static async postJson(url: string, data: any, genericError='Unable to save record') {
        const req = await ApiClient.post(url, data)
    
        if (req && req.ok) return req?.json()

        throw genericError
    }   
}
