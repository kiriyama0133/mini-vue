//lib/runtime-core/index.ts
import { renderOptions } from '../runtime-dom';
import { VNode, Container, VNodeChildren, isSameVNode, VNodeChild } from './vnode';
import { ShapeFlags } from '../shared/shapeFlags';
import { patchProps } from '../runtime-dom/patchProps';
import { MiniElement } from '../runtime-dom/nodeOps';
import { isArray } from '../utils/object';

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
  // diff
  const patchKeyedChildren = (c1: VNode[], c2: VNode[], container: Container) => {
    console.log('TODO: diff', c1, c2);
  };
  const mountChildren = (children: VNode[], parent: Container) => {
    console.log('[mountChildren]: ', children, parent, 'mount');
    for (const child of children) {
      patch(null, child, parent);
    }
  };
  const mountElement = (vnode: VNode, container: Container) => {
    const { type, props, children, shapeFlag } = vnode;
    const el = (vnode.el = hostCreateElement(type));
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children as string);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children as VNode[], el);
    }
    hostInsert(el, container);
  };
  const unmountChildren = (children: VNode[]) => {
    children.forEach((child) => {
      unmount(child);
    });
  };
  const processElemet = (n1: VNode | null, n2: VNode, container: Container) => {
    console.log(`[processElement]:`, n1, n2, container, 'patch');
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
    patchChildren(n1, n2, el);
  };
  const patchChildren = (n1: VNode, n2: VNode, container: MiniElement) => {
    console.log(`[patchChildren]: `, n1, n2, 'patchChildren');
    const c1 = n1.children;
    const c2 = n2.children;
    const prevShapeFlag = n1.shapeFlag;
    const shapeFlag = n2.shapeFlag;

    // 新节点 children 是文本
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      /**
       * ARRAY -> TEXT
       *
       * old:
       * <div>
       *   <span></span>
       * </div>
       *
       * new:
       * <div>
       *   hello
       * </div>
       */
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1 as VNode[]);
      }
      /**
       * TEXT -> TEXT
       */
      if (c1 !== c2) {
        hostSetElementText(container, c2 as string);
      }
    }
    // 新节点 children 是数组
    else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      /**
       * TEXT -> ARRAY
       *
       * old:
       * <div>hello</div>
       *
       * new:
       * <div>
       *   <span></span>
       * </div>
       */
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, '');
        mountChildren(c2 as VNode[], container);
      }
      /**
       * ARRAY -> ARRAY
       *
       * 后续实现 keyed diff
       */
      else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        patchKeyedChildren(c1 as VNode[], c2 as VNode[], container);
      }
    }
    // 新节点没有 children
    else {
      /**
       * TEXT -> EMPTY
       */
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, '');
      }
      /**
       * ARRAY -> EMPTY
       */
      else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1 as VNode[]);
      }
    }
  };
  const patch = (n1: VNode | null, n2: VNode, container: Container) => {
    if (n1 === n2) {
      return;
    }
    if (n1 !== null) {
      if (!isSameVNode(n1, n2)) {
        console.log('[patch<VNode>]', n1, n2, 'unmount');
        unmount(n1);
        n1 = null; // 原节点不复用
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
    if (vnode === null) {
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
