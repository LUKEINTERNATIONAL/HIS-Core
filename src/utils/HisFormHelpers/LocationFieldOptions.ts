import {LocationService} from "@/services/location_service"
import { Option } from "@/components/Forms/FieldInterface"
import { isEmpty } from "lodash"

export async function getFacilities(filter=''): Promise<Option[]> {
    const facilities = await LocationService.getFacilities({name: filter})
    // For some reason, facilities array has an initial blank string. from the api
    if (!isEmpty(facilities)) facilities.splice(0, 1)

    return facilities.map((facility: any) => ({
        label: facility.name,
        value: facility.location_id,
        other: facility
    }))
}

export async function getRegions(): Promise<Option[]> {
    const regions = await LocationService.getRegions()
    return regions.map((region: any) => ({
        label: region.name,
        value: region.region_id,
        other: region
    }))
}

export async function getDistricts(regionID: number): Promise<Option[]> {
    const districts = await LocationService.getDistricts(regionID)
    return districts.map((district: any) => ({
        label: district.name,
        value: district.district_id,
        other: district
    }))
}

export async function getTraditionalAuthorities(districtID: number): Promise<Option[]> {
    const TAs = await LocationService.getTraditionalAuthorities(districtID)
    return TAs.map((TA: any) => ({
        label: TA.name,
        value: TA.traditional_authority_id,
        other: TA
    }))
}

export async function getVillages(traditionalAuthorityID: number): Promise<Option[]> {
    const villages = await LocationService.getVillages(traditionalAuthorityID)
    return villages.map((village: any) => ({
        label: village.name,
        value: village.village_id,
        other: village
    }))
}
