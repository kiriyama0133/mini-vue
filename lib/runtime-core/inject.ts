// lib/runtime-core/inject.ts

import { getCurrentInstance } from './component';

declare const InjectionKeyType: unique symbol;
export type InjectionKey<T = unknown> = symbol & {
  readonly [InjectionKeyType]?: T;
};
export type InjectKey<T> = InjectionKey<T> | string;
export type Provides = Record<PropertyKey, unknown>;
export function provide<T>(key: InjectKey<T>, value: T): void {
  const instance = getCurrentInstance();
  if (!instance) {
    console.warn('provide() can only be used inside setup()');
    return;
  }
  let provides = instance.provides;
  const parentProvides = instance.parent?.provides;
  if (parentProvides && provides === parentProvides) {
    provides = instance.provides = Object.create(parentProvides);
  }
  provides[key] = value;
}
export function inject<T>(key: InjectKey<T>, defaultValue?: T): T | undefined {
  const instance = getCurrentInstance();
  if (!instance) {
    console.warn('inject() can only be used inside setup()');
    return defaultValue;
  }
}
