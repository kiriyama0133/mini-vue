// lib/runtime-core/component.ts

import { ReactiveEffect } from '../effect';
import { reactive } from '../reactivity';
import { proxyRefs } from '../ref';
import { hasOwn, isFunction, isObject } from '../utils/object';
import { initProps, updateProps } from '../utils/props';
import type { LifecycleHooksArray } from './apiLifecyle';
import { Emit, emit, Expose } from './emit';
import { queueJob } from './schedular';
import { initSlots, Slots } from './slot';
import type { Container, SetupContext, SetupProps, VNode } from './vnode';

export interface Component {
  setup?: (setupProps: SetupProps, setupContext: SetupContext) => any;
  render?: () => VNode;
  expose: Expose;
  data?: () => Record<string, any>;
  props?: string[] | Record<string, any>;
  mounted?: (proxy: any) => void;
}
export interface ComponentInstance {
  vnode: VNode;
  data: any;
  slots: Slots;
  props: Record<string, any>;
  attrs: Record<string, any>;
  emit: Emit;
  exposed: Record<string, unknown>;
  proxy: any;
  update: Function | null;
  type: Component;
  setupState: Record<string, any>;
  render: Function | null;
  subTree: VNode | null;
  isMounted: boolean;
  parent: ComponentInstance | null;
  provides: Record<PropertyKey, unknown>;
  bm: LifecycleHooksArray;
  m: LifecycleHooksArray;
  bu: LifecycleHooksArray;
  u: LifecycleHooksArray;
  bum: LifecycleHooksArray;
  um: LifecycleHooksArray;
  isUnmounted: boolean;
  effect: ReactiveEffect | null;
}
export type PatchFunction = (
  n1: VNode | null,
  n2: VNode,
  container: Container,
  anchor?: Node | null,
  parentComponent?: ComponentInstance | null
) => void;
export type UnmountFunction = (vnode: VNode) => void;
export type UnmountComponentFunction = (
  instance: ComponentInstance,
  internals: ComponentRendererInternals
) => void;

export interface ComponentRendererInternals {
  patch: PatchFunction;
  unmount: UnmountFunction;
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
    bm: [],
    u: [],
    um: [],
    bum: [],
    m: [],
    bu: [],
    isUnmounted: false,
    effect: null,
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
// cycle-function invoke
function invokeLifecycleHooks(hooks: LifecycleHooksArray): void {
  if (hooks) {
    hooks.forEach((hook) => hook());
  }
}
export const unmountComponent: UnmountComponentFunction = (instance, internals) => {
  if (instance.isUnmounted) {
    return;
  }
  invokeLifecycleHooks(instance.bum);
  instance.isUnmounted = true;
  instance.effect?.stop();
  if (instance.subTree) {
    internals.unmount(instance.subTree);
  }
  invokeLifecycleHooks(instance.um);
};
const setupComponent = (instance: ComponentInstance) => {
  initProps(instance, instance.vnode.props);
  initSlots(instance, instance.vnode.children);

  const Component = instance.type;
  instance.render = Component.render ?? null;

  if (Component.data) {
    instance.data = reactive(Component.data());
  }
  if (Component.mounted) {
    instance.m.push(() => {
      Component.mounted?.call(instance.proxy, instance.proxy);
    });
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
      invokeLifecycleHooks(instance.bm);
      const subTree = instance.render?.call(instance.proxy, instance.proxy);
      instance.subTree = subTree;
      internals.patch(null, subTree, container, anchor, instance); // render
      vnode.el = subTree.el;
      instance.isMounted = true;
      invokeLifecycleHooks(instance.m);
      // instance.type.mounted?.call(instance.proxy, instance.proxy);
    } else {
      const prevTree = instance.subTree;
      const nextTree = instance.render?.call(instance.proxy, instance.proxy);
      instance.subTree = nextTree;
      internals.patch(prevTree, nextTree, container, anchor, instance); // update
      invokeLifecycleHooks(instance.u);
    }
  };

  let update: () => void;
  const reactiveEffect = new ReactiveEffect(componentUpdateFn, () => {
    queueJob(update);
  });
  instance.effect = reactiveEffect;
  update = instance.update = () => {
    if (instance.isUnmounted) {
      return;
    }
    reactiveEffect.run();
  };
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
