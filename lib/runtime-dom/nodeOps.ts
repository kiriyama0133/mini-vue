// lib/runtime-dom/nodeOps.ts
// crud actions for dom nodes...
import type { Invoker } from './event';

/**
 * 节点操作
 */
export const nodeOps = {
  createElement,
  createText,
  insert,
  remove,
  setElementText,
  setText,
  parentNode,
  nextSibling,
  querySelector,
};
export enum NodeTypes {
  ELEMENT = 1,
  TEXT = 3,
}
export type MiniNode = Node & {};
export type MiniElement = HTMLElement & {
  _vei?: Record<string, Invoker>;
};
export type MiniText = Text & {};
function createElement(tag: string): MiniElement {
  return document.createElement(tag) as MiniElement;
}
function createText(text: string): MiniText {
  return document.createTextNode(text) as MiniText;
}
function insert(child: MiniNode, parent: MiniNode, anchor?: MiniNode | null) {
  parent.insertBefore(child, anchor || null);
}
function remove(child: MiniNode) {
  const parent = child.parentNode;
  if (parent) parent.removeChild(child);
}
function setElementText(el: MiniNode, text: string) {
  el.textContent = text;
}
function setText(node: MiniText, text: string) {
  node.nodeValue = text;
}
function parentNode(node: MiniNode) {
  return node.parentNode;
}
function nextSibling(node: MiniNode) {
  return node.nextSibling;
}
function querySelector(selector: string) {
  return document.querySelector(selector);
}
