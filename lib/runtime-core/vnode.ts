//lib/runtime-core/vnode.ts

import type { Component, ComponentInstance } from './component';
import { Emit, Expose } from './emit';
import { Slots } from './slot';
export type SetupProps = Readonly<Record<string, any>>;
export interface SetupContext {
  attrs: Record<string, any>; // 没有被声明为 props 的属性
  slots: Slots; // 父组件传入的插槽
  emit: Emit; // 触发组件事件
  expose: Expose; // 决定父组件通过 ref 能访问哪些内容
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
export type VNodeType = string | Symbol | Component;
export type Container = Element & {
  _vnode?: VNode | null;
};
export function isVNode(vnode: any): vnode is VNode {
  return vnode.__v_isVnode;
}
export function isSameVNode(n1: VNode, n2: VNode) {
  return n1.type === n2.type && n1.key === n2.key;
}
export function isText(node: Node): node is Text {
  return node.nodeType === Node.TEXT_NODE;
}
export type { ComponentInstance };
