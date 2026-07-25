export declare enum DirtyLevels {
  Dirty = 4, // run computed
  NoDirty = 0,
}
export interface ComputedRef<T> {
  readonly value: T;
  readonly __v_isRef: true;
}
export interface WritableComputedRef<T> extends ComputedRef<T> {
  value: T;
  readonly __v_isRef: true;
}
export interface WritableComputedOptions<T> {
  get(): T;
  set(newValue: T): void;
}
export declare function computed<T>(getter: () => T): ComputedRef<T>;
export declare function computed<T>(options: WritableComputedOptions<T>): WritableComputedRef<T>;
