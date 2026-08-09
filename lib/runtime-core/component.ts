// lib/runtime-core/component.ts

import { ReactiveEffect } from '../effect';
import { reactive } from '../reactivity';
import { proxyRefs } from '../ref';
import { hasOwn, isFunction, isObject } from '../utils/object';
import { initProps, updateProps } from '../utils/props';
import { emit } from './emit';
import { queueJob } from './schedular';
import { initSlots } from './slot';
import type { ComponentInstance, Container, VNode } from './vnode';

export type PatchFunction = (
  n1: VNode | null,
  n2: VNode,
  container: Container,
  anchor?: Node | null,
  parentComponent?: ComponentInstance | null
) => void;

export interface ComponentRendererInternals {
  patch: PatchFunction;
}

let currentInstance: ComponentInstance | null = null;
export function getCurrentInstance(): ComponentInstance | null {
  return currentInstance;
}
function setCurrentInstance(instance: ComponentInstance | null): void {
  currentInstance = instance;
}
const createComponentInstance = (
  vnode: VNode,
  parent: ComponentInstance | null
): ComponentInstance => {
  const instance: ComponentInstance = {
    vnode,
    parent,
    provides: parent ? parent.provides : Object.create(null),
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
    setCurrentInstance(instance); // setup-entry
    let setupResult;
    try {
      setupResult = Component.setup(instance.props, setupContext);
    } finally {
      setCurrentInstance(null); // setup-out
    }
    if (isFunction(setupResult)) {
      instance.render = setupResult;
    } else if (isObject(setupResult)) {
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
      const { setupState, data, props } = target;
      if (typeof key === 'symbol') {
        return true;
      }
      if (hasOwn(setupState, key)) {
        setupState[key] = value;
        return true;
      }
      if (hasOwn(data, key)) {
        data[key] = value;
        return true;
      }
      if (hasOwn(props, key)) {
        console.warn('props is readonly');
        return true;
      }
      return true;
    },
  });
};

const setupRenderEffect = (
  instance: ComponentInstance,
  vnode: VNode,
  container: Container,
  anchor: Node | null,
  internals: ComponentRendererInternals
) => {
  const componentUpdateFn = () => {
    if (!instance.isMounted) {
      const subTree = instance.render?.call(instance.proxy, instance.proxy);
      instance.subTree = subTree;
      internals.patch(null, subTree, container, anchor, instance); // render
      vnode.el = subTree.el;
      instance.isMounted = true;
      instance.type.mounted?.call(instance.proxy, instance.proxy);
    } else {
      const prevTree = instance.subTree;
      const nextTree = instance.render?.call(instance.proxy, instance.proxy);
      instance.subTree = nextTree;
      internals.patch(prevTree, nextTree, container, anchor, instance); // update
    }
  };

  let update: () => void;
  const reactiveEffect = new ReactiveEffect(componentUpdateFn, () => {
    queueJob(update);
  });
  update = instance.update = () => reactiveEffect.run();
  update();
};

const mountComponent = (
  vnode: VNode,
  container: Container,
  anchor: Node | null,
  parentComponent: ComponentInstance | null,
  internals: ComponentRendererInternals
) => {
  console.log('[mountComponent]: ', vnode);
  const instance = createComponentInstance(vnode, parentComponent);
  vnode.component = instance;
  setupComponent(instance);
  setupRenderEffect(instance, vnode, container, anchor, internals);
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

export const processComponent = (
  n1: VNode | null,
  n2: VNode,
  container: Container,
  anchor: Node | null,
  parentComponent: ComponentInstance | null,
  internals: ComponentRendererInternals
) => {
  console.log('[processComponent]');
  if (n1 === null) {
    mountComponent(n2, container, anchor, parentComponent, internals);
  } else {
    updateComponent(n1, n2);
  }
};
