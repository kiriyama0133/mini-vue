//lib/runtime-core/vnode.ts
export interface VNode {
  type: any;
  props: Record<string, any> | null;
  children: VNodeChidren;
  el: Node | null;
}
export type VNodeChidren = string | VNode[] | null;
export type Container = any;
