export function isNullOrEmpty(val: any): boolean {
    if (val === null || val === undefined) {
        return true;
    }
    if (typeof val === 'string' && val.trim() === '') {
        return true;
    }
    if (Array.isArray(val) && val.length === 0) {
        return true;
    }
    if (typeof val === 'object' && Object.keys(val).length === 0) {
        return true;
    }
    return false;
}
