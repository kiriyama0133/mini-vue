declare const InjectionKeyType: unique symbol;
export type InjectionKey<T = unknown> = symbol & {
  readonly [InjectionKeyType]?: T;
};
export type InjectKey<T> = InjectionKey<T> | string;
export type Provides = Record<PropertyKey, unknown>;
export declare function provide<T>(key: InjectKey<T>, value: T): void;
export declare function inject<T>(key: InjectKey<T>, defaultValue?: T): T | undefined;
export {};
