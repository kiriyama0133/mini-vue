//lib/runtime-core/index.ts
import { renderOptions } from '../runtime-dom';
import { VNode, Container, VNodeChildren } from './vnode';
import { ShapeFlags } from '../shared/shapeFlags';

export { h } from './h';
export function createRenderer(RenderOptions: typeof renderOptions) {
  const {
    createElement: hostCreateElement,
    createText: hostCreateText,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
    setText: hostSetText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    patchProp: hostPatchProp,
  } = RenderOptions;
  const mountChildren = (children: VNodeChildren, parent: Container) => {
    if (Array.isArray(children)) {
      for (const child of children) {
        mountElement(child, parent);
      }
    }
  };
  const mountElement = (vnode: VNode, container: Container) => {
    const { type, props, children, shapeFlag } = vnode;
    let el = hostCreateElement(type);
    hostInsert(el, container);
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    // 9 & 8 > 0 text_children
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children as string);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el);
    }

    console.log('[mountElement<VNode>]', vnode);

    // const el = hostCreateElement(vnode.type);
  };
  const patch = (n1: VNode, n2: VNode, container: Container) => {
    if (n1 == n2) {
      return;
    }
    if (n1 === null) {
      mountElement(n2, container);
    }
  };
  const render = (vnode: VNode, container: Container) => {
    patch(container._vnode || null, vnode, container);
    container._vnode = vnode;
  };

  return {
    render,
  };
}
