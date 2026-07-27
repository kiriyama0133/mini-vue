import { Ref } from '../ref';
export type WatchSource<T = any> = (() => T) | Ref<T> | object;
export interface WatchOptions {
  immediate?: boolean;
  deep?: boolean;
  flush?: 'pre' | 'post' | 'sync';
}
export declare function watch<T>(
  source: WatchSource<T>,
  cb: (newValue: T, oldValue: T | undefined) => void,
  options?: object
): void;
export declare function watchEffect(fn: (onCleanup: (cb: () => void) => void) => void): void;
