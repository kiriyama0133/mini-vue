//lib/runtime-core/index.ts
import { renderOptions } from '../runtime-dom';
import {
  VNode,
  Container,
  VNodeChildren,
  isSameVNode,
  VNodeChild,
  isText,
  ComponentInstance,
  VNodeProps,
  emit,
} from './vnode';
import { ShapeFlags } from '../shared/shapeFlags';
import { patchProps } from '../runtime-dom/patchProps';
import { MiniElement } from '../runtime-dom/nodeOps';
import { hasOwn, isArray, isFunction, isObject } from '../utils/object';
import { reactive } from '../reactivity/index';
import { effect, ReactiveEffect } from '../effect';
import { queueJob } from './schedular';
import { initProps, updateProps } from '../utils/props';
import { proxyRefs } from '../ref';
import { initSlots } from './slot';

export { h } from './h';
export const Text = Symbol('Text');
export const Fragment = Symbol('Fragnment');
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
    let i = 0;
    let e1 = c1.length - 1; //tail
    let e2 = c2.length - 1;
    // left
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVNode(n1, n2)) {
        // recursion diff
        patch(n1, n2, container);
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
        patch(n1, n2, container);
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
          patch(null, c2[i], container, anchor);
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
          patch(vnode, c2[newIndex], container);
        }
      }
      // insertBefore
      let toBePatched = e2 - s2 + 1;
      for (let i = toBePatched - 1; i >= 0; i--) {
        let newIndex = s2 + i;
        let anchor = newIndex + 1 < c2.length ? c2[newIndex + 1].el : null;
        let vnode = c2[newIndex];
        if (!vnode.el) {
          patch(null, vnode, container, anchor);
        } else {
          hostInsert(vnode.el!, container, anchor);
        }
      }
    }
  };
  const mountChildren = (children: VNode[], parent: Container) => {
    console.log('[mountChildren]: ', children, parent, 'mount');
    for (const child of children) {
      patch(null, child, parent);
    }
  };
  const mountElement = (vnode: VNode, container: Container, anchor: Node | null) => {
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
    anchor: Node | null
  ) => {
    console.log(`[processElement]:`, n1, n2, container, 'patch');
    if (n1 === null) {
      mountElement(n2, container, anchor);
    } else {
      patchElement(n1, n2);
    }
  };
  const patchElement = (n1: VNode, n2: VNode) => {
    let el = (n2.el = n1.el as MiniElement);
    if (!el) {
      return;
    }
    let oldProps = n1.props || {};
    let newProps = n2.props || {};
    patchProps(el as MiniElement, oldProps, newProps);
    patchChildren(n1, n2, el);
  };
  const patchChildren = (n1: VNode, n2: VNode, container: Container) => {
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
  // region: component-start
  const createComponentInstance = (vnode: VNode): ComponentInstance => {
    const instance: ComponentInstance = {
      vnode: vnode,
      data: {},
      attrs: {},
      emit: () => {},
      exposed: {},
      proxy: null,
      update: null,
      props: vnode.props || {},
      type: vnode.type,
      setupState: {},
      render: null,
      slots: {},
      subTree: null,
      isMounted: false,
    };
    instance.emit = emit.bind(null, instance);
    return instance;
  };
  const setupComponent = (instance: ComponentInstance) => {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    const Component = instance.type;
    instance.render = Component.render ?? null;
    if (Component.data) {
      instance.data = reactive(Component.data());
    }
    if (Component.setup) {
      const setupContext = {
        attrs: instance.attrs,
        slots: instance.slots,
        emit: instance.emit,
        expose(exposed = {}) {
          instance.exposed = exposed;
        },
      };
      const setupResult = Component.setup(instance.props, setupContext);
      if (isFunction(setupResult)) {
        instance.render = setupResult; // return render
      } else if (isObject(setupResult)) {
        // return funtions and states exposed
        instance.setupState = proxyRefs(setupResult);
      }
    }
    instance.proxy = new Proxy(instance, {
      get(target, key) {
        const { setupState, data, props, attrs, slots, emit } = target;
        if (typeof key === 'symbol') {
          return;
        }
        if (hasOwn(setupState, key)) {
          return setupState[key];
        }
        if (hasOwn(data, key)) {
          return data[key];
        }
        if (hasOwn(props, key)) {
          return props[key];
        }
        if (key === '$emit') {
          return emit;
        }
        if (key === '$attrs') {
          return attrs;
        }
        if (key === '$slots') {
          return slots;
        }
      },
      set(target, key, value) {
        const { setupState, data, props, attrs } = target;
        if (typeof key === 'symbol') {
          return true;
        }
        if (hasOwn(setupState, key) && setupState) {
          setupState[key] = value;
          return true;
        }
        if (hasOwn(data, key) && data) {
          data[key] = value;
          return true;
        }
        if (hasOwn(props, key) && props) {
          console.warn('props is readonly');
          return true;
        }
        return true;
      },
    });
  };
  const mountComponent = (vnode: VNode, container: Container, anchor: Node | null = null) => {
    console.log('[mountComponent]: ', vnode);
    const instance = createComponentInstance(vnode);
    vnode.component = instance; // save instance
    setupComponent(instance);
    setupRenderEffect(instance, vnode, container, anchor);
  };
  const setupRenderEffect = (
    instance: ComponentInstance,
    vnode: VNode,
    container: Container,
    anchor: Node | null = null
  ) => {
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        const subTree = instance.render?.call(instance.proxy, instance.proxy);
        instance.subTree = subTree;
        patch(null, subTree, container, anchor);
        vnode.el = subTree.el;
        instance.isMounted = true;
        instance.type.mounted?.call(instance.proxy, instance.proxy);
      } else {
        const prevTree = instance.subTree;
        const nextTree = instance.render?.call(instance.proxy, instance.proxy);
        instance.subTree = nextTree;
        patch(prevTree, nextTree, container, anchor);
      }
    };
    let update: () => void;
    const effect = new ReactiveEffect(componentUpdateFn, () => {
      queueJob(update);
    });
    update = instance.update = () => effect.run();
    update();
  };
  const updateComponent = (n1: VNode, n2: VNode) => {
    const instance = (n2.component = n1.component);
    if (!instance) {
      throw new Error('Component instance is missing');
    }
    const prevProps = n1.props ?? {};
    const nextProps = n2.props ?? {};
    instance.vnode = n2;
    n2.el = n1.el;
    updateProps(instance, prevProps, nextProps);
    instance.update?.();
  };
  const processComponent = (
    n1: VNode | null,
    n2: VNode,
    container: Container,
    anchor: Node | null = null
  ) => {
    console.log('[processComponent]');
    if (n1 === null) {
      mountComponent(n2, container, anchor);
    } else {
      // component update
      updateComponent(n1, n2);
    }
  };
  //region: component-end
  const processFragment = (n1: VNode | null, n2: VNode, conatiner: Container) => {
    if (n1 === null) {
      if (n2.children) {
        mountChildren(n2.children as VNode[], conatiner);
      }
    } else {
      patchChildren(n1, n2, conatiner);
    }
  };
  const patch = (n1: VNode | null, n2: VNode, container: Container, anchor: Node | null = null) => {
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
        processFragment(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElemet(n1, n2, container, anchor);
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          console.log('[patch]: component');
          processComponent(n1, n2, container, anchor);
        }
        break;
    }
  };
  const unmount = (vnode: VNode) => {
    if (vnode.type === Fragment) {
      if (vnode.children) {
        unmountChildren(vnode.children as VNode[]);
      }
      return;
    }
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
