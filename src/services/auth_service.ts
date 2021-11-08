import {Role} from "@/interfaces/role"
import ApiClient from "./api_client"

export class InvalidCredentialsError extends Error {
    message: string
    constructor() {
        super()
        this.message = 'Invalid username/password'
    }
}

export class AuthService{
    username: string
    userID: number
    roles: Role[]
    token: string
    sessionDate: string
    systemVersion: string

    constructor() {
        this.token = ''
        this.username = ''
        this.roles = []
        this.userID = -1
        this.sessionDate = ''
        this.systemVersion = ''
    }    

    setUsername(username: string) { this.username = username }

    async login(password: string) {
        const response = await this.requestLogin(password)
        if (response) {
            const {
                authorization: {
                    token, 
                    user
                }
            } = response
            this.token = token
            this.roles = user.roles
            this.userID = user.user_id
            this.sessionDate = await this.getSystemDate()
            this.systemVersion = await this.getApiVersion()
        } else {
            throw 'Unable to login'
        }
    }

    startSession() {
        sessionStorage.setItem("apiKey", this.token);
        sessionStorage.setItem("username", this.username);
        sessionStorage.setItem("userID", this.userID.toString());
        sessionStorage.setItem("userRoles", JSON.stringify(this.roles));
        sessionStorage.setItem("sessionDate", this.sessionDate)
        sessionStorage.setItem("APIVersion", this.systemVersion)
    }

    clearSession() { sessionStorage.clear() }

    requestLogin(password: string) {
        return this.postLogin(`auth/login`, {
            username: this.username,
            password: password
        })
    }

    async getApiVersion(): Promise<string> {
        const api: any = this.getJson('version')
        return api ? api['System version'] || 'none' : ''
    }

    async getSystemDate(): Promise<string> {
        const {date} = await this.getJson('current_time')
        return date
    }

    private async getJson(url: string) {
        const req = await ApiClient.get(url)
        if (req && req.ok) 
            return req?.json()
    }

    private async postLogin(url: string, params: Record<string, number | string>) {
        const req = await ApiClient.post(url, params)
        if (!req) 
            return

        if (req.ok) {
            return req.json()
        }

        if (req.status === 401)
            throw new InvalidCredentialsError()
    }
}