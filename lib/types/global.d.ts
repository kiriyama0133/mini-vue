// lib/types/global.d.ts

/**
 * 响应式对象映射
 * @param T 响应式对象类型
 * @returns
 */
export type ReactiveMap<T extends object> = WeakMap<T, any>;
