//lib/runtime-core/index.ts
import { renderOptions } from '../runtime-dom';
import { VNode, Container, VNodeChildren, isSameVNode } from './vnode';
import { ShapeFlags } from '../shared/shapeFlags';
import { patchProps } from '../runtime-dom/patchProps';
import { MiniElement } from '../runtime-dom/nodeOps';

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
    let el = (vnode.el = hostCreateElement(type));
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
  const processElemet = (n1: VNode | null, n2: VNode, container: Container) => {
    if (n1 === null) {
      mountElement(n2, container);
    } else {
      patchElement(n1, n2);
    }
  };
  const patchElement = (n1: VNode, n2: VNode) => {
    let el = (n2.el = n1.el);
    if (!el) {
      return;
    }
    let oldProps = n1.props || {};
    let newProps = n2.props || {};
    patchProps(el as MiniElement, oldProps, newProps);
  };
  const patchChildren = (n1: VNode, n2: VNode, container: Container) => {
    const c1 = n1.children;
    const c2 = n2.children;
    const prevShapeFlag = n1.shapeFlag;
    const nextShapeFlag = n2.shapeFlag;
  };
  const patch = (n1: VNode | null, n2: VNode, container: Container) => {
    if (n1 === n2) {
      return;
    }
    if (n1 !== null) {
      if (!isSameVNode(n1, n2)) {
        console.log('[patch<VNode>]', n1, n2, 'unmount');
        unmount(n1);
        n1 = null;
      }
    }
    processElemet(n1, n2, container);
  };
  const unmount = (vnode: VNode) => {
    if (vnode.el) {
      hostRemove(vnode.el);
      vnode.el = null;
    }
  };
  const render = (vnode: VNode, container: Container) => {
    if (vnode == null) {
      if (container._vnode) {
        unmount(container._vnode);
      }
    }
    patch(container._vnode || null, vnode, container);
    container._vnode = vnode;
  };

  return {
    render,
  };
}
const renderer = createRenderer(renderOptions);
export const { render } = renderer;
