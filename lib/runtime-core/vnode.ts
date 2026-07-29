//lib/runtime-core/vnode.ts
export interface VNode {
  type: any;
  __v_isVnode: boolean;
  props: VNodeProps | null;
  children: VNodeChildren;
  el: Node | null;
  key: string | number | null;
  shapeFlag: number;
}
export type VNodeChildren = VNodeChild | VNodeChild[] | Record<string, any>;
export type VNodeChild = VNode | string | number | null | boolean;
export type VNodeProps = {
  key?: string | number;
  [key: string]: any;
};
export type VNodeOptions = {
  type: VNodeType;
  props?: VNodeProps;
  children?: VNodeChildren;
};
export type VNodeType = string | Symbol;
export type Container = any;
export function isVNode(vnode: any): vnode is VNode {
  return vnode.__v_isVnode;
}
