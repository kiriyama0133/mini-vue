import { ReactiveEffect } from '../effect';
import { LifecycleHooksArray } from './apiLifecyle';
import { Emit, Expose } from './emit';
import { Slots } from './slot';
import { Container, SetupContext, SetupProps, VNode } from './vnode';
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
export declare function getCurrentInstance(): ComponentInstance | null;
export declare const unmountComponent: UnmountComponentFunction;
export declare const processComponent: (
  n1: VNode | null,
  n2: VNode,
  container: Container,
  anchor: Node | null,
  parentComponent: ComponentInstance | null,
  internals: ComponentRendererInternals
) => void;
