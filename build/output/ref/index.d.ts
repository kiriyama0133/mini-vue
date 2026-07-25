export interface Ref<T = any> {
  value: T;
  readonly __v_isRef: true;
}
export type UnwrapRef<T> = T extends Ref<infer V> ? V : T;
export type ShallowUnwrapRef<T extends object> = {
  [K in keyof T]: UnwrapRef<T[K]>;
};
export type ToRefs<T extends object> = {
  [K in keyof T]: Ref<T[K]>;
};
export declare function ref<T>(value: T): Ref<T>;
export declare function isRef<T = any>(value: unknown): value is Ref<T>;
declare class ObjectRefImpl<T extends object, K extends keyof T> implements Ref<T[K]> {
  _object: T;
  _key: K;
  constructor(_object: T, _key: K);
  readonly __v_isRef = true;
  get value(): T[K];
  set value(newValue: T[K]);
}
export declare function toRef<T extends object, K extends keyof T>(
  object: T,
  key: K
): ObjectRefImpl<T, K>;
export declare function toRefs<T extends object>(object: T): ToRefs<T>;
/**
 * 代理响应式对象，当访问响应式对象的属性时，返回的是响应式对象的属性值，而不是响应式对象的属性引用
 * @param object 响应式对象
 * @returns
 */
export declare function proxyRefs<T extends object>(object: T): ShallowUnwrapRef<T>;
export {};
