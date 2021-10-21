export default function kbHandler(newInput: string, accumulator: string): string {
    let output = accumulator
    if (newInput.match(/delete|del/i)) {
        output = output.substring(0, output.length - 1)
    } else if (newInput.match(/space/i)) {
        output = `${accumulator} `
    } else if (newInput.match(/unknown/i)) {
        output = 'Unknown'
    } else {
        output = `${accumulator}${newInput}`
    }
    if (typeof output === 'string' && output) {
        output = output.charAt(0).toUpperCase() + output.slice(1)
    }
    return output
}
