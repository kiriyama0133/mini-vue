import { Container, VNode } from './vnode';
export declare const Teleport: {
  __is_Teleport: boolean;
  process(
    n1: VNode | null,
    n2: VNode,
    container: Container,
    anchor: Node | null,
    internals: TeleportRendererInternals
  ): void;
};
export interface TeleportRendererInternals {
  mountChildren(children: VNode[], container: Container): void;
  patchChildren(n1: VNode, n2: VNode, container: Container): void;
  unmountChildren(children: VNode[]): void;
  createText(text: string): Node;
  insert(child: Node, parent: Node, anchor?: Node | null): void;
  querySelector(selector: string): Element | null;
}
export declare const isTeleport: (value: any) => boolean;
