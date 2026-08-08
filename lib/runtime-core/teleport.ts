//lib/runtime-core/teleport.ts

import type { Container, VNode } from './vnode';

export const Teleport = {
  __is_Teleport: true,
  process(
    n1: VNode | null,
    n2: VNode,
    container: Container,
    anchor: Node | null,
    internals: TeleportRendererInternals
  ) {
    const { mountChildren, patchChildren, unmountChildren, createText, insert, querySelector } =
      internals;
    const target = resolveTarget(n2.props?.to, querySelector);
    if (!target) {
      console.warn(`[Teleport]: target "${n2.props?.to}" not found`);
      return;
    }
    if (n1 === null) {
      n2.el = createText('');
      insert(n2.el, container, anchor);
      mountChildren(n2.children as VNode[], target);
      return;
    }
    n2.el = n1.el;
    const oldTarget = resolveTarget(n1.props?.to, querySelector);
    if (oldTarget === target) {
      patchChildren(n1, n2, target);
    } else {
      if (Array.isArray(n1.children)) {
        unmountChildren(n1.children as VNode[]);
      }
      if (Array.isArray(n2.children)) {
        mountChildren(n2.children as VNode[], target);
      }
    }
  },
};
export interface TeleportRendererInternals {
  mountChildren(children: VNode[], container: Container): void;
  patchChildren(n1: VNode, n2: VNode, container: Container): void;
  unmountChildren(children: VNode[]): void;
  createText(text: string): Node;
  insert(child: Node, parent: Node, anchor?: Node | null): void;
  querySelector(selector: string): Element | null;
}
function resolveTarget(
  to: unknown,
  querySelector: (selector: string) => Element | null
): Container | null {
  if (typeof to === 'string') {
    return querySelector(to) as Container | null;
  }
  if (to && typeof to === 'object') {
    return to as Container;
  }
  return null;
}
export const isTeleport = (value: any): boolean => {
  return !!(
    value &&
    typeof value === 'object' &&
    (value as { __is_Teleport?: boolean }).__is_Teleport
  );
};
