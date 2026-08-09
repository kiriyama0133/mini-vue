import { Container, VNode } from './vnode';
export type PatchFunction = (
  n1: VNode | null,
  n2: VNode,
  container: Container,
  anchor?: Node | null
) => void;
export interface ComponentRendererInternals {
  patch: PatchFunction;
}
export declare const processComponent: (
  n1: VNode | null,
  n2: VNode,
  container: Container,
  anchor: Node | null,
  internals: ComponentRendererInternals
) => void;
