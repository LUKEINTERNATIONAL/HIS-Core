export function isValueEmpty(value: string) {
    return value.match(/(Unknown|^\s*$|None)/i)
}