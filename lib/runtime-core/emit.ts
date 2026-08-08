// lib/runtime-core/emit.ts

import { camelize, toHandlerKey } from '../utils/object';
import { ComponentInstance } from './vnode';

export type Emit = (event: string, ...args: unknown[]) => void;
export type Expose = (exposed?: Record<string, unknown>) => void;
export function emit(instance: ComponentInstance, event: string, ...args: any[]): void {
  const { props } = instance;
  const handlerName = toHandlerKey(camelize(event));
  const handler = props[handlerName];
  if (typeof handler === 'function') {
    handler(...args);
  }
}
