export function isValueEmpty(value: string) {
    try {
        return value.match(/(^\s*$|None)/i)
    }catch(e) {
        return true
    }
}
