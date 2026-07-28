//lib/runtime-core/index.ts
import { renderOptions } from '../runtime-dom';
import { VNode, Container } from './vnode';

export function createRenderer(renderOptions: any) {
  const {
    createElement: hostCreateElement,
    createText: hostCreateText,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
    setText: hostSetText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
  } = renderOptions;
  const patch = (n1: VNode, n2: VNode, container: Container) => {};
  const render = (vnode: VNode, container: Container) => {
    patch(container._vnode || null, vnode, container);
  };
}
