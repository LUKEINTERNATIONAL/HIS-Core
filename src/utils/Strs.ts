export function isValueEmpty(value: string) {
    try {
        return value.match(/(Unknown|^\s*$|None)/i)
    }catch(e) {
        return true
    }
}