//lib/index.ts

export { reactive } from './reactivity';
export { effect } from './effect';
export { ref, isRef, toRef, toRefs, proxyRefs } from './ref';
export { computed } from './effect/computed';
export { watch } from './effect/watch';
export { renderOptions } from './runtime-dom';
export { createRenderer, h } from './runtime-core';

export type { ReactiveMap } from './types/global';
export type { Ref, ShallowUnwrapRef, ToRefs, UnwrapRef } from './ref';
