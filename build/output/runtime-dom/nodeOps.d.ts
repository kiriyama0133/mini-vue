import { Invoker } from './event';
/**
 * 节点操作
 */
export declare const nodeOps: {
  createElement: typeof createElement;
  createText: typeof createText;
  insert: typeof insert;
  remove: typeof remove;
  setElementText: typeof setElementText;
  setText: typeof setText;
  parentNode: typeof parentNode;
  nextSibling: typeof nextSibling;
  querySelector: typeof querySelector;
};
export declare enum NodeTypes {
  ELEMENT = 1,
  TEXT = 3,
}
export type MiniNode = Node & {};
export type MiniElement = HTMLElement & {
  _vei?: Record<string, Invoker>;
};
export type MiniText = Text & {};
declare function createElement(tag: string): MiniElement;
declare function createText(text: string): MiniText;
declare function insert(child: MiniNode, parent: MiniNode, anchor?: MiniNode | null): void;
declare function remove(child: MiniNode): void;
declare function setElementText(el: MiniNode, text: string): void;
declare function setText(node: MiniText, text: string): void;
declare function parentNode(node: MiniNode): ParentNode | null;
declare function nextSibling(node: MiniNode): ChildNode | null;
declare function querySelector(selector: string): Element | null;
export {};
