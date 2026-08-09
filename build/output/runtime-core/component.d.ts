import { ComponentInstance, Container, VNode } from './vnode';
export type PatchFunction = (
  n1: VNode | null,
  n2: VNode,
  container: Container,
  anchor?: Node | null,
  parentComponent?: ComponentInstance | null
) => void;
export interface ComponentRendererInternals {
  patch: PatchFunction;
}
export declare function getCurrentInstance(): ComponentInstance | null;
export declare const processComponent: (
  n1: VNode | null,
  n2: VNode,
  container: Container,
  anchor: Node | null,
  parentComponent: ComponentInstance | null,
  internals: ComponentRendererInternals
) => void;
