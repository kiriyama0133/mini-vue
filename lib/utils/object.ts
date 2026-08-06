export function isObject(value: any) {
  return value !== null && typeof value === 'object';
}
export function isString(value: any) {
  return typeof value === 'string';
}
export function isArray(value: any) {
  return Array.isArray(value);
}
export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}
export function hasOwn(target: object, key: PropertyKey) {
  return Object.prototype.hasOwnProperty.call(target, key);
}
