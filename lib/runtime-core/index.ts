//lib/runtime-core/index.ts
import { renderOptions } from '../runtime-dom';

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
  // const render = (vnode, container) => {

  // }
  // return {
  //     render,
  // }
}
