// lib/runtime-core/inject.ts

declare const InjectionKeyType: unique symbol;
export type InjectionKey<T = unknown> = symbol & {
  readonly [InjectionKeyType]?: T;
};
export type InjectKey<T> = InjectionKey<T> | string;
export type Provides = Record<PropertyKey, unknown>;
export function provide<T>(key: InjectKey<T>, value: T): void {
  // 后续实现
}
export function inject<T>(key: InjectionKey, defaultaValue?: T): T | undefined {
  return;
}
