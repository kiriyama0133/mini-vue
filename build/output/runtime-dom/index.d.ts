import { patchProp } from './patchProps';
declare const renderOptions: {
  patchProp: typeof patchProp;
} & {
  createElement: (tag: string) => import('./nodeOps').MiniElement;
  createText: (text: string) => import('./nodeOps').MiniText;
  insert: (
    child: import('./nodeOps').MiniNode,
    parent: import('./nodeOps').MiniNode,
    anchor?: import('./nodeOps').MiniNode | null
  ) => void;
  remove: (child: import('./nodeOps').MiniNode) => void;
  setElementText: (el: import('./nodeOps').MiniElement, text: string) => void;
  setText: (node: import('./nodeOps').MiniText, text: string) => void;
  parentNode: (node: import('./nodeOps').MiniNode) => ParentNode | null;
  nextSibling: (node: import('./nodeOps').MiniNode) => ChildNode | null;
};
export { renderOptions };
