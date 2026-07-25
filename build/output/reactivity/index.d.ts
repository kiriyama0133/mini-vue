import { ReactiveEffect } from '../effect';
export declare enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
  RAW = '__v_raw',
}
export declare function isReactive(value: unknown): boolean;
export declare function reactive<T extends object>(target: T): T;
/**
 * 依赖收集
 * @param target 目标对象
 * @param key 目标对象的属性名
 */
export declare function track(target: object, key: string | symbol): void;
/**
 * 依赖收集
 * @param dep 依赖集合
 */
export declare function trackEffects(dep: Set<ReactiveEffect>): void;
/**
 * 触发依赖
 * @param target 目标对象
 * @param key 目标对象的属性名
 */
export declare function trigger(target: object, key: string | symbol): void;
/**
 * 触发依赖
 * @param dep 依赖集合
 */
export declare function triggerEffects(dep: Set<ReactiveEffect>): void;
/**
 * 转换为响应式对象
 * @param value 原始值
 * @returns 响应式对象
 */
export declare function toReactive<T>(value: T): T;
