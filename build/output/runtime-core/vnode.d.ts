import { Component, ComponentInstance } from './component';
import { Emit, Expose } from './emit';
import { Slots } from './slot';
export type SetupProps = Readonly<Record<string, any>>;
export declare const Text: unique symbol;
export declare const Fragment: unique symbol;
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
  anchor?: Node | null;
  key: string | number | null;
  shapeFlag: number;
  component?: ComponentInstance;
}
export type VNodeChildren = VNodeArrayChildren | VNodeChild | Slots;
export type VNodeChild = VNode | string | number | null | boolean;
export type VNodeArrayChildren = Array<VNodeChild | VNodeArrayChildren>;
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
export type VNodeType = string | Symbol | Component;
export type Container = Element & {
  _vnode?: VNode | null;
};
export declare function isVNode(value: unknown): value is VNode;
export declare function isSameVNode(n1: VNode, n2: VNode): boolean;
export declare function isText(node: Node): node is Text;
export type { ComponentInstance };
