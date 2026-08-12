//lib/runtime-core/index.ts

import { renderOptions } from '../runtime-dom';
import { VNode, Container, isSameVNode, isText } from './vnode';
import { ShapeFlags } from '../shared/shapeFlags';
import { patchProps } from '../runtime-dom/patchProps';
import { MiniElement } from '../runtime-dom/nodeOps';
import {
  ComponentInstance,
  ComponentRendererInternals,
  processComponent,
  unmountComponent,
} from './component';

export { h } from './h';
export const Text = Symbol('Text');
export const Fragment = Symbol('Fragnment');
export { Teleport } from '../runtime-core/teleport';
export { onBeforeUnmount, onUnmounted } from './apiLifecyle';
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
    querySelector: hostQuerySelector,
  } = RenderOptions;
  // diff
  const patchKeyedChildren = (
    c1: VNode[],
    c2: VNode[],
    container: Container,
    parentComponent: ComponentInstance | null
  ) => {
    console.log('TODO: diff', c1, c2);
    let i = 0;
    let e1 = c1.length - 1; //tail
    let e2 = c2.length - 1;
    // left
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVNode(n1, n2)) {
        // recursion diff
        patch(n1, n2, container, null, parentComponent);
      } else {
        break;
      }
      i++;
    }
    console.log('[diff]: ', i, e1, e2);
    // right
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVNode(n1, n2)) {
        patch(n1, n2, container, null, parentComponent);
      } else break;
      e1--;
      e2--;
    }
    console.log('[diff]: ', i, e1, e2);
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = c2[nextPos]?.el ?? null;

        while (i <= e2) {
          patch(null, c2[i], container, anchor, parentComponent);
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i]);
        i++;
      }
    } else {
      // middle
      let s1 = i;
      let s2 = i;
      const keyToNewIndexMap = new Map();
      for (let i = s2; i <= e2; i++) {
        const vnode = c2[i];
        keyToNewIndexMap.set(vnode.key, i);
      }
      for (let i = s1; i <= e1; i++) {
        const vnode = c1[i];
        const newIndex = keyToNewIndexMap.get(vnode.key);
        if (newIndex == undefined) {
          unmount(vnode);
        } else {
          patch(vnode, c2[newIndex], container, null, parentComponent);
        }
      }
      // insertBefore
      let toBePatched = e2 - s2 + 1;
      for (let i = toBePatched - 1; i >= 0; i--) {
        let newIndex = s2 + i;
        let anchor = newIndex + 1 < c2.length ? c2[newIndex + 1].el : null;
        let vnode = c2[newIndex];
        if (!vnode.el) {
          patch(null, vnode, container, anchor, parentComponent);
        } else {
          hostInsert(vnode.el!, container, anchor);
        }
      }
    }
  };
  const mountChildren = (
    children: VNode[],
    parent: Container,
    parentComponent: ComponentInstance | null
  ) => {
    console.log('[mountChildren]: ', children, parent, 'mount');
    for (const child of children) {
      patch(null, child, parent, null, parentComponent);
    }
  };
  const mountElement = (
    vnode: VNode,
    container: Container,
    anchor: Node | null,
    parentComponent: ComponentInstance | null
  ) => {
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
      mountChildren(children as VNode[], el, parentComponent);
    }
    hostInsert(el, container, anchor);
  };
  const unmountChildren = (children: VNode[]) => {
    children.forEach((child) => {
      unmount(child);
    });
  };
  const processElemet = (
    n1: VNode | null,
    n2: VNode,
    container: Container,
    anchor: Node | null,
    parentComponent: ComponentInstance | null
  ) => {
    console.log(`[processElement]:`, n1, n2, container, 'patch');
    if (n1 === null) {
      mountElement(n2, container, anchor, parentComponent);
    } else {
      patchElement(n1, n2, parentComponent);
    }
  };
  const patchElement = (n1: VNode, n2: VNode, parentComponent: ComponentInstance | null) => {
    let el = (n2.el = n1.el as MiniElement);
    if (!el) {
      return;
    }
    let oldProps = n1.props || {};
    let newProps = n2.props || {};
    patchProps(el as MiniElement, oldProps, newProps);
    patchChildren(n1, n2, el, parentComponent);
  };
  const patchChildren = (
    n1: VNode,
    n2: VNode,
    container: Container,
    parentComponent: ComponentInstance | null
  ) => {
    console.log(`[patchChildren]: `, n1, n2, 'patchChildren');
    const c1 = n1.children;
    const c2 = n2.children;
    const prevShapeFlag = n1.shapeFlag;
    const shapeFlag = n2.shapeFlag;

    // 新节点 children 是文本
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      /**
       * ARRAY -> TEXT
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
       */
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, '');
        mountChildren(c2 as VNode[], container, parentComponent);
      }
      /**
       * ARRAY -> ARRAY
       */
      else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        patchKeyedChildren(c1 as VNode[], c2 as VNode[], container, parentComponent);
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
  const processText = (n1: VNode | null, n2: VNode, container: Container) => {
    if (n1 === null) {
      const textNode = (n2.el = hostCreateText(n2.children as string));
      hostInsert(textNode, container);
    } else {
      const el = (n2.el = n1.el);
      if (n2.children !== n1.children) {
        if (el && isText(el)) {
          hostSetText(el, n2.children as string);
        }
      }
    }
  };
  const processFragment = (
    n1: VNode | null,
    n2: VNode,
    conatiner: Container,
    parentComponent: ComponentInstance | null
  ) => {
    if (n1 === null) {
      if (n2.children) {
        mountChildren(n2.children as VNode[], conatiner, parentComponent);
      }
    } else {
      patchChildren(n1, n2, conatiner, parentComponent);
    }
  };
  const patch = (
    n1: VNode | null,
    n2: VNode,
    container: Container,
    anchor: Node | null = null,
    parentComponent: ComponentInstance | null = null
  ) => {
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
    const { type, shapeFlag } = n2;
    switch (type) {
      case Text:
        processText(n1, n2, container);
        break;
      case Fragment:
        processFragment(n1, n2, container, parentComponent);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElemet(n1, n2, container, anchor, parentComponent);
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          console.log('[patch]: component');
          processComponent(n1, n2, container, anchor, parentComponent, internals);
        } else if (shapeFlag & ShapeFlags.TELEPORT) {
          type.process(n1, n2, container, anchor, {
            mountChildren,
            patchChildren,
            unmountChildren,
            createText: hostCreateText,
            insert: hostInsert,
            querySelector: hostQuerySelector,
          });
        }
        break;
    }
  };
  const unmount = (vnode: VNode) => {
    // component
    if (vnode.shapeFlag & ShapeFlags.COMPONENT) {
      if (vnode.component) {
        unmountComponent(vnode.component, internals);
      }
      return;
    }
    // Fragment
    if (vnode.type === Fragment) {
      if (vnode.children) {
        unmountChildren(vnode.children as VNode[]);
      }
      return;
    }
    // teleport
    if (vnode.shapeFlag & ShapeFlags.TELEPORT && Array.isArray(vnode.children)) {
      unmountChildren(vnode.children as VNode[]);
    }
    // element
    if (
      vnode.shapeFlag & ShapeFlags.ELEMENT &&
      vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN &&
      Array.isArray(vnode.children)
    ) {
      unmountChildren(vnode.children as VNode[]);
    }
    if (vnode.el) {
      hostRemove(vnode.el);
      vnode.el = null;
    }
  };
  const render = (vnode: VNode | null, container: Container): void => {
    if (vnode === null) {
      if (container._vnode) {
        unmount(container._vnode);
      }
      container._vnode = null;
      return;
    }
    patch(container._vnode || null, vnode, container);
    container._vnode = vnode;
  };
  const internals: ComponentRendererInternals = {
    patch,
    unmount,
  };
  return {
    render,
  };
}
const renderer = createRenderer(renderOptions);
export const { render } = renderer;
