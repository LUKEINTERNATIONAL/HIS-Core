import { Service } from "./service";

export class GlobalPropertyService extends Service {
    constructor() {
        super()
    }

    static async get(prop: string) {
        const res = await super.getJson('global_properties', { property: prop })

        if (res && prop in res) return res[prop]
    }

    static async isProp(property: string) {
        const [prop, val] = property.split('=')
        const curVal = await this.get(prop)

        if (curVal) return val === curVal

        return false
    }

    static set(prop: string, val: string | number) {
        return super.postJson('global_properties', {
            'property': prop, 'property_value': val 
        })   
    }

    static getSitePrefix() { return this.get('site_prefix') }

    static getSiteUUID() { return this.get('site_uuid') }

    static getCurrentHealthCenterId() { return this.get('current_health_center_id') }

    static async isMilitarySite() { 
        try {
            const enabled = await this.get('military_site') 
            return enabled === 'true'
        }catch(e) {
            return false
        }
    }
    static async filingNumbersEnabled() {
        const prop = await this.get('use.filing.number')
        if (prop) {
            return prop === 'true'
        }
        return false
    }

    static isHTNEnabled() { return this.get('activate.htn.enhancement') }
    static getAppointmentLimit() { return this.get('clinic.appointment.limit') }
    static isStockManagementEnabled() { return this.get('activate.drug.management') }

}