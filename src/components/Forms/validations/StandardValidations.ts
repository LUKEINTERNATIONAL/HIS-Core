import { ConceptService } from "@/services/concept_service"
import {isEmpty} from "lodash"

function required(value: any): null | Array<string> {
    return isEmpty(value) ? ['Value is required'] : null
}

function isMWPhoneNumber(val: any) {
    //Regex source: https://gist.github.com/kwalter94/1861f1f0fa192382a75a445ad70f07ec
    const validation = /^(\+?265|0)(((88|99)\d{7})|(1\d{6})|(2\d{8})|(31\d{8}))$/
    return !val || !val.value.match(validation) ? ['Not a valid phone number']: null
}

function isName(value: any): null | Array<string> {
    const validation = /^(?=.{2,100}$)[a-z!A-Z]+(?:['_.\-!\][a-z]+[a-z!A-Z])*$/
    return !value || !value.label.match(validation) ? ['Invalid name Input']: null
}

function isNumber(val: any): null | Array<string> {
    return isNaN(parseInt(val.value)) ? ['Value must be a number'] : null
}

function hasLengthRangeOf(val: any, min: number, max: number): null | Array<string> {
    const len = val ? val.label.length : 0
    return len >= min && len <= max ? null : [`Value length not within range of ${min} - ${max}`] 
}

function rangeOf(val: any, min: number, max: number): null | Array<string> {
    const value = parseInt(val.label)
    return value >= min && value <= max ? null: [`${value} not within range of ${min} - ${max}`]
}
function neitherOr(val: any): null | Array<string> {
    const allNo = val.filter((arr: any) => {
        const val = arr.value || arr.other.value
        return val === 'No'
    });
    if(allNo.length == val.length) {
        return ['All values can not be no']
    }
    return null;
}
function anyEmpty(val: any): null | Array<string> {
    const error = ['all must be selected']

    if (!val) return error

    const allNo = val.filter((i: any) => i.value === '')
    return allNo.length > 0 ? error : null
}
function notTheSame(val: any, comparison: string): null | Array<string> {
    return val.value === comparison ? ['Values can not be the same'] : null;
}
export default {
    required,
    isMWPhoneNumber,
    isName,
    isNumber,
    hasLengthRangeOf,
    rangeOf,
    neitherOr,
    anyEmpty,
    notTheSame
}