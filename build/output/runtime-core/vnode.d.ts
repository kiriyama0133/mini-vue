import { ComponentInstance } from './component';
import { Emit, Expose } from './emit';
import { Slots } from './slot';
export type SetupProps = Readonly<Record<string, any>>;
export interface SetupContext {
  attrs: Record<string, any>;
  slots: Slots;
  emit: Emit;
  expose: Expose;
}
export interface VNode {
  type: any | Symbol;
  __v_isVnode: boolean;
  props: VNodeProps | null;
  children: VNodeChildren;
  el: Node | null;
  key: string | number | null;
  shapeFlag: number;
  component?: ComponentInstance;
}
export type VNodeChildren = VNodeChild | VNodeChild[] | Slots;
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
export type { ComponentInstance };
