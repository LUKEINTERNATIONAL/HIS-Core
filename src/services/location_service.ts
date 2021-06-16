import { Service } from '@/services/service'

export class LocationService extends Service {
    constructor() {
        super()
    }

    static getFacilities() {
        return super.getJson('/locations?name=')
    }

    static getRegions() {
        return super.getJson('/regions')
    }

    static getDistricts(regionID: number) {
        return super.getJson('/districts', {'region_id': regionID})
    }

    static getVillages(traditionalAuthorityID: number) {
        return super.getJson('/villages', {'traditional_authority_id': traditionalAuthorityID})
    }

    static getTraditionalAuthorities(villageID: number) {
        return super.getJson('/traditional_authorities', {'district_id': villageID})
    }
}
