import { MiniElement } from './nodeOps';
export interface Invoker {
  (e: Event): void;
  value: Function;
}
export declare function patchEvent(el: MiniElement, key: string, value: Function | null): void;
