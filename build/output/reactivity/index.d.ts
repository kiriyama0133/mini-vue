export declare enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
  RAW = '__v_raw',
}
export declare function isReactive(value: unknown): boolean;
export declare function reactive<T extends object>(target: T): T;
export declare function track(target: object, key: string | symbol): void;
