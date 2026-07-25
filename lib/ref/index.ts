// lib/ref/index.ts
import { toReactive, trackEffects, triggerEffects } from '../reactivity';
import type { ReactiveEffect } from '../effect';
import { activeEffect } from '../effect';

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

export function ref<T>(value: T): Ref<T> {
  return createRef(value);
}

function createRef<T>(value: T): Ref<T> {
  return new RefImpl(value);
}

class RefImpl<T> implements Ref<T> {
  public readonly __v_isRef = true; // ref flag
  public _value: T;
  public dep?: Set<ReactiveEffect>;
  constructor(public rawValue: T) {
    this._value = toReactive(rawValue);
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newValue: T) {
    this.rawValue = newValue;
    this._value = toReactive(newValue);
    triggerRefValue(this);
  }
}

function trackRefValue(ref: RefImpl<any>) {
  if (activeEffect) {
    if (!ref.dep) {
      ref.dep = new Set();
    }
    trackEffects(ref.dep);
  }
}
function triggerRefValue(ref: RefImpl<any>) {
  if (ref.dep) {
    triggerEffects(ref.dep);
  }
}

export function isRef<T = any>(value: unknown): value is Ref<T> {
  return !!(value && (value as any).__v_isRef);
}

//toRefs, toRef
class ObjectRefImpl<T extends object, K extends keyof T> implements Ref<T[K]> {
  constructor(
    public _object: T,
    public _key: K
  ) {}
  public readonly __v_isRef = true; // ref flag
  get value() {
    return this._object[this._key];
  }
  set value(newValue: T[K]) {
    this._object[this._key] = newValue;
  }
}
export function toRef<T extends object, K extends keyof T>(object: T, key: K) {
  return new ObjectRefImpl(object, key);
}
export function toRefs<T extends object>(object: T): ToRefs<T> {
  const res = {} as ToRefs<T>;
  for (let key in object) {
    const typedKey = key as keyof T;
    res[typedKey] = new ObjectRefImpl(object, typedKey) as ToRefs<T>[typeof typedKey];
  }
  return res;
}
/**
 * 代理响应式对象，当访问响应式对象的属性时，返回的是响应式对象的属性值，而不是响应式对象的属性引用
 * @param object 响应式对象
 * @returns
 */
export function proxyRefs<T extends object>(object: T): ShallowUnwrapRef<T> {
  return new Proxy(object, {
    get(target, key, receiver) {
      const r = Reflect.get(target, key, receiver);
      return isRef(r) ? r.value : r;
    },
    set(target, key, value, receiver) {
      const oldValue = Reflect.get(target, key, receiver);
      if (isRef(oldValue) && !isRef(value)) {
        oldValue.value = value;
        return true;
      }
      return Reflect.set(target, key, value, receiver);
    },
  }) as ShallowUnwrapRef<T>;
}
