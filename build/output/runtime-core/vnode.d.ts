export interface VNode {
  type: any | Symbol;
  __v_isVnode: boolean;
  props: VNodeProps | null;
  children: VNodeChildren;
  el: Node | null;
  key: string | number | null;
  shapeFlag: number;
}
export type VNodeChildren = VNodeChild | VNodeChild[];
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
export type RendererNode = Node;
export type RendererElement = Element;
export type VNodeType = string | Symbol;
export type Container = Element & {
  _vnode?: VNode | null;
};
export declare function isVNode(vnode: any): vnode is VNode;
export declare function isSameVNode(n1: VNode, n2: VNode): boolean;
export declare function isText(node: Node): node is Text;
