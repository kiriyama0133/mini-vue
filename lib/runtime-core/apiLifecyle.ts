// lib/runtime-core/apiLifecycle.ts

import { getCurrentInstance } from './component';
import type { ComponentInstance } from './component';

export enum LifecycleHooks {
  BEFORE_MOUNT = 'bm',
  MOUNTED = 'm',
  BEFORE_UPDATE = 'bu',
  UPDATED = 'u',
  BEFORE_UNMOUNT = 'bum',
  UNMOUNTED = 'um',
}
export type LifecycleHook = () => void;
export type LifecycleHooksArray = LifecycleHook[];
export function injectHook(
  type: LifecycleHooks,
  hook: LifecycleHook,
  target: ComponentInstance | null = getCurrentInstance()
): void {
  if (!target) {
    console.warn('Lifecycle hooks can only be registered during setup()');
    return;
  }
  target[type]!.push(hook);
}
function createHook(type: LifecycleHooks) {
  return (hook: LifecycleHook): void => {
    injectHook(type, hook);
  };
}
// cycles exported
export const onBeforeUnmount = createHook(LifecycleHooks.BEFORE_UNMOUNT);
export const onUnmounted = createHook(LifecycleHooks.UNMOUNTED);
export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT);
export const onMounted = createHook(LifecycleHooks.MOUNTED);
export const onBeforeUpdate = createHook(LifecycleHooks.BEFORE_UPDATE);
export const onUpdated = createHook(LifecycleHooks.UPDATED);
