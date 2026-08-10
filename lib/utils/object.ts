// lib/utils/object.ts

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
export const camelize = (value: string): string => {
  return value.replace(/-(\w)/g, (_, char: string) => {
    return char ? char.toUpperCase() : '';
  });
};
export const capitalize = (value: string): string => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};
export const toHandlerKey = (value: string): string => {
  return value ? `on${capitalize(value)}` : '';
};
