//lib/effect/computed.ts
import { ReactiveEffect, activeEffect } from '../effect';
import { trackEffects, triggerEffects } from '../reactivity';

export enum DirtyLevels {
  Dirty = 4, // run computed
  NoDirty = 0,
}
export interface ComputedRef<T> {
  // readonly ref
  readonly value: T;
  readonly __v_isRef: true;
}
export interface WritableComputedRef<T> extends ComputedRef<T> {
  // writable ref
  value: T;
  readonly __v_isRef: true;
}
export interface WritableComputedOptions<T> {
  get(): T;
  set(newValue: T): void;
}
export function computed<T>(getter: () => T): ComputedRef<T>;

export function computed<T>(options: WritableComputedOptions<T>): WritableComputedRef<T>;

export function computed<T>(getterOrOptions: any) {
  if (typeof getterOrOptions === 'function') {
    return new WritableComputedRefImpl(getterOrOptions, undefined);
  } else {
    return new WritableComputedRefImpl(getterOrOptions.get, getterOrOptions.set);
  }
}

class WritableComputedRefImpl<T> implements WritableComputedRef<T> {
  public readonly __v_isRef = true;
  public dep?: Set<ReactiveEffect>;
  private dirtyLevel = DirtyLevels.Dirty;
  private _value!: T;
  private effect!: ReactiveEffect;
  constructor(
    private getter: () => T,
    private setter?: (newValue: T) => void
  ) {
    this.effect = new ReactiveEffect(this.getter, () => {
      this.dirtyLevel = DirtyLevels.Dirty;
      triggerComputedRef(this);
    });
  }
  set dirty(value: boolean) {
    this.dirtyLevel = value ? DirtyLevels.Dirty : DirtyLevels.NoDirty;
  }
  get dirty() {
    return this.dirtyLevel === DirtyLevels.Dirty;
  }
  get value() {
    trackComputedRef(this);
    if (this.dirtyLevel === DirtyLevels.Dirty) {
      this._value = this.effect.run();
      this.dirtyLevel = DirtyLevels.NoDirty;
    }
    return this._value;
  }
  set value(newValue: T) {
    if (this.setter) {
      this.setter?.call(this, newValue);
    } else {
      console.warn('computed ref is readonly');
    }
  }
}
function trackComputedRef(computedRef: WritableComputedRefImpl<any>) {
  if (activeEffect) {
    if (!computedRef.dep) {
      computedRef.dep = new Set();
    }
    trackEffects(computedRef.dep);
  }
}
function triggerComputedRef(computedRef: WritableComputedRefImpl<any>) {
  if (computedRef.dep) {
    triggerEffects(computedRef.dep);
  }
}
