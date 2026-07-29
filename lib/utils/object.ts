export function isObject(value: any) {
  return value !== null && typeof value === 'object';
}
export function isString(value: any) {
  return typeof value === 'string';
}
export function isArray(value: any) {
  return Array.isArray(value);
}
