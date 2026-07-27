//lib/effect/watch.ts

import { isRef, Ref } from '../ref';
import { ReactiveEffect } from '.';
import { isReactive } from '../reactivity';

export type WatchSource<T = any> = (() => T) | Ref<T> | object;
export interface WatchOptions {
  immediate?: boolean;
  deep?: boolean;
  flush?: 'pre' | 'post' | 'sync';
}
export function watch<T>(
  source: WatchSource<T>,
  cb: (newValue: T, oldValue: T | undefined) => void,
  options?: object
) {
  doWatch(source, cb, options);
}
export function watchEffect(fn: (onCleanup: (cb: () => void) => void) => void) {
  let cleanup: (() => void) | undefined;
  const onCleanup = (cb: () => void) => {
    cleanup = cb;
  };
  let effect: ReactiveEffect;
  const runner = () => {
    cleanup?.();
    cleanup = undefined;
    fn(onCleanup);
  };
  effect = new ReactiveEffect(
    () => {
      runner();
    },
    () => {
      effect.run();
    }
  );
  effect.run();
}

function doWatch<T>(
  source: WatchSource<T>,
  cb: (newValue: T, oldValue: T | undefined) => void,
  options?: WatchOptions
) {
  const reacitveGetter = (source: any) => traverse(source, options?.deep ? 1 : undefined);
  let getter: () => any;
  if (isRef(source)) {
    getter = () => source.value;
  } else if (isReactive(source)) {
    getter = () => reacitveGetter(source);
  } else {
    getter = () => source;
  }
  let oldValue: T | undefined;
  const job = () => {
    const newValue = effect.run();
    cb(newValue, oldValue);
    oldValue = newValue;
  };
  if (options?.immediate) {
    job();
  }
  const effect = new ReactiveEffect(getter, job);
  oldValue = effect.run();
}

function traverse(value: any, depth?: number, currentDepth = 0, seen = new Set<any>()) {
  if (typeof value !== 'object' || value === null) {
    return value;
  }
  if (depth !== undefined && currentDepth >= depth) {
    return value;
  }
  if (seen.has(value)) {
    return value;
  }
  seen.add(value);
  for (const key in value) {
    traverse(value[key], depth, currentDepth + 1, seen);
  }
  return value;
}
