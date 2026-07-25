// dependences collect
import { isPlainObject } from '../utils/object';
import type { ReactiveMap } from '../types/global';
import { activeEffect } from '../effect';
import type { ReactiveEffect } from '../effect';

const reactiveMap: ReactiveMap<object> = new WeakMap();
const targetMap: WeakMap<object, Map<string | symbol, Set<ReactiveEffect>>> = new WeakMap();
const mutableHandlers: ProxyHandler<any> = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) return true;
    if (key === ReactiveFlags.IS_READONLY) return false;
    if (key === ReactiveFlags.RAW) return target;

    // effect track
    track(target, key);
    let result = Reflect.get(target, key, receiver);
    if (isPlainObject(result)) {
      result = createReactiveObject(result);
    }
    return result;
  },
  set(target, key, value, receiver) {
    let oldValue = Reflect.get(target, key, receiver);
    if (oldValue === value) return false;
    // update
    let result = Reflect.set(target, key, value, receiver);
    if (result) {
      trigger(target, key);
    }
    return result;
  },
};
export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
  RAW = '__v_raw',
}
export function isReactive(value: unknown): boolean {
  return !!(value && (value as any)[ReactiveFlags.IS_REACTIVE]);
}
export function reactive<T extends object>(target: T): T {
  return createReactiveObject(target as object);
}
export function track(target: object, key: string | symbol) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set<ReactiveEffect>()));
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
}
function createReactiveObject(target: object) {
  if (!isPlainObject(target)) return target;
  if (reactiveMap.has(target)) return reactiveMap.get(target);
  let proxy = new Proxy(target, mutableHandlers);
  reactiveMap.set(target, proxy);
  return proxy;
}
function trigger(target: object, key: string | symbol) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  console.log('[trigger]', key, dep);
  if (!dep) return;
  const effects = new Set(dep);
  console.log('[execute]', effects);
  effects.forEach((effect) => {
    if (effect !== activeEffect) {
      if (effect.scheduler) {
        {
          if (!effect.running) {
            // prevent infinite loop
            effect.scheduler();
          }
        }
      } else {
        effect.run();
      }
    }
  });
}
