export function isValidISODate(value) {
    const date = new Date(value)
    if (!date.getTime()) return false
    const iso = date.toISOString().substring(0, value.length - 1) + 'Z'
    return iso === value
}
