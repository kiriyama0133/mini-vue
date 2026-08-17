//lib/runtime-dom/event.ts

import { MiniElement } from './nodeOps';

export interface Invoker {
  (e: Event): void;
  value: Function;
}
export function patchEvent(el: MiniElement, key: string, value: Function | null) {
  const invokers = el._vei || (el._vei = {});
  const existingInvoker = invokers[key];
  if (existingInvoker) {
    if (value) {
      existingInvoker.value = value;
    } else {
      const eventName = key.slice(2).toLowerCase();
      el.removeEventListener(eventName, existingInvoker);
      delete invokers[key];
    }
    return;
  }
  if (value) {
    const eventName = key.slice(2).toLowerCase();
    const invoker = (invokers[key] = createInvoker(value));
    el.addEventListener(eventName, invoker);
  }
}
function createInvoker(fn: Function): Invoker {
  const invoker = ((e: Event) => {
    invoker.value(e);
  }) as Invoker;
  invoker.value = fn;
  return invoker;
}
