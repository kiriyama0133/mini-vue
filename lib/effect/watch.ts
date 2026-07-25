//lib/effect/watch.ts

import { Ref } from '../ref';
import { ReactiveEffect } from '.';
import { effect } from '.';

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
function doWatch<T>(
  source: WatchSource<T>,
  cb: (newValue: T, oldValue: T | undefined) => void,
  options?: WatchOptions
) {
  const reacitveGetter = (source: any) => traverse(source, options?.deep ? 1 : undefined);
  let getter = () => reacitveGetter(source);
  let oldValue: T | undefined;
  const job = () => {
    const newValue = effect.run();
    cb(newValue, oldValue);
    oldValue = newValue;
  };
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
