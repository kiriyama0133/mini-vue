// dependences collect
import { isObject } from '../utils/object';
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
    if (isObject(result)) {
      result = createReactiveObject(result);
    }
    return result;
  },
  set(target, key, value, receiver) {
    let oldValue = Reflect.get(target, key, receiver);
    // 相同值不需要触发更新，但赋值本身仍然是成功的。
    if (oldValue === value) return true;
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
/**
 * 依赖收集
 * @param target 目标对象
 * @param key 目标对象的属性名
 */
export function track(target: object, key: string | symbol) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  trackEffects(dep);
}
/**
 * 依赖收集
 * @param dep 依赖集合
 */
export function trackEffects(dep: Set<ReactiveEffect>) {
  if (dep.has(activeEffect!)) {
    return;
  }
  dep.add(activeEffect!);
  activeEffect!.deps.push(dep);
}
function createReactiveObject(target: object) {
  if (!isObject(target)) return target;
  if (reactiveMap.has(target)) return reactiveMap.get(target);
  let proxy = new Proxy(target, mutableHandlers);
  reactiveMap.set(target, proxy);
  return proxy;
}
/**
 * 触发依赖
 * @param target 目标对象
 * @param key 目标对象的属性名
 */
export function trigger(target: object, key: string | symbol) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  console.log('[trigger]', key, dep);
  if (!dep) return;
  const effects = new Set(dep);
  console.log('[execute]', effects);
  triggerEffects(dep);
}
/**
 * 触发依赖
 * @param dep 依赖集合
 */
export function triggerEffects(dep: Set<ReactiveEffect>) {
  const effects = new Set(dep);
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
/**
 * 转换为响应式对象
 * @param value 原始值
 * @returns 响应式对象
 */
export function toReactive<T>(value: T): T {
  return isObject(value) ? createReactiveObject(value as object) : value;
}
