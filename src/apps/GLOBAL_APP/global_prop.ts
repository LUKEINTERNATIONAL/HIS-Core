import { GlobalPropertyService } from "@/services/global_property_service";

export enum GLOBAL_PROP {
    MILITARY_SITE = 'military_site',
    HEALTH_CENTER_ID = 'current_health_center_id',
    SITE_PREFIX = 'site_prefix',
    SITE_UUID = 'site_uuid',
    PORTAL_ENABLED = 'portal.enabled',
    PORTAL_PROPERTIES = 'portal.properties',
    DDE_ENABLED = 'dde_enabled'
}

function ddeEnabled() {
    return GlobalPropertyService.get(GLOBAL_PROP.DDE_ENABLED)
}

function militarySiteEnabled() {
    return GlobalPropertyService.get(GLOBAL_PROP.MILITARY_SITE)
}

function healthCenterID() {
    return GlobalPropertyService.get(GLOBAL_PROP.HEALTH_CENTER_ID)
}

function siteCode() {
    return GlobalPropertyService.get(GLOBAL_PROP.SITE_PREFIX)
}

function portalEnabled() {
    return GlobalPropertyService.get(GLOBAL_PROP.PORTAL_ENABLED)
}

function setSitePrefix(prefix: string) {
    return GlobalPropertyService.set(GLOBAL_PROP.SITE_PREFIX, prefix)
}

function setPortalIP(ipAddress: string) {
    return GlobalPropertyService.set(GLOBAL_PROP.PORTAL_PROPERTIES, ipAddress)
}

function setPortalEnabled(isTrue: boolean) {
    return GlobalPropertyService.set(GLOBAL_PROP.PORTAL_ENABLED, `${isTrue}`)
}

export default {
    ddeEnabled,
    militarySiteEnabled,
    healthCenterID,
    siteCode,
    portalEnabled,
    setSitePrefix,
    setPortalIP,
    setPortalEnabled
}