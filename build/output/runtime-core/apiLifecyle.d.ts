import { ComponentInstance } from './component';
export declare enum LifecycleHooks {
  BEFORE_MOUNT = 'bm',
  MOUNTED = 'm',
  BEFORE_UPDATE = 'bu',
  UPDATED = 'u',
  BEFORE_UNMOUNT = 'bum',
  UNMOUNTED = 'um',
}
export type LifecycleHook = () => void;
export type LifecycleHooksArray = LifecycleHook[];
export declare function injectHook(
  type: LifecycleHooks,
  hook: LifecycleHook,
  target?: ComponentInstance | null
): void;
export declare const onBeforeUnmount: (hook: LifecycleHook) => void;
export declare const onUnmounted: (hook: LifecycleHook) => void;
